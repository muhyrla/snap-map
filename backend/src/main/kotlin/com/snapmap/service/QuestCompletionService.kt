package com.snapmap.service

import com.snapmap.model.CompletedQuest
import com.snapmap.model.UserQuest
import com.snapmap.model.UserQuestStatus
import com.snapmap.repository.CompletedQuestRepository
import com.snapmap.repository.QuestRepository
import com.snapmap.repository.UserQuestRepository
import com.snapmap.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

/**
 * Засчитывает квест по результату верификации от воркера.
 * Вызывается из VerificationEventListener, когда решение = APPROVED.
 */
@Service
class QuestCompletionService(
    private val userRepository: UserRepository,
    private val questRepository: QuestRepository,
    private val userQuestRepository: UserQuestRepository,
    private val completedQuestRepository: CompletedQuestRepository,
    private val statsService: StatsService,
) {
    companion object {
        private val logger = LoggerFactory.getLogger(QuestCompletionService::class.java)
    }

    /**
     * @return true если квест был засчитан (награда начислена), false если пропущено.
     */
    @Transactional
    fun completeVerified(
        userId: Long,
        questId: Long?,
        objectKey: String,
        allowFeedPhotos: Boolean,
        description: String? = null,
    ): Boolean {
        val user = userRepository.findById(userId).orElse(null)
        if (user == null) {
            logger.warn("Cannot complete quest: user {} not found", userId)
            return false
        }

        // Защита от повторного зачёта одного и того же квеста
        if (questId != null && completedQuestRepository.existsByUserIdAndQuestId(userId, questId)) {
            logger.info("Quest {} already completed by user {}, skipping", questId, userId)
            return false
        }

        val quest = questId?.let { questRepository.findById(it).orElse(null) }

        // Отмечаем UserQuest как COMPLETED
        if (questId != null) {
            val existing = userQuestRepository.findByUserIdAndQuestId(userId, questId)
            if (existing != null) {
                existing.status = UserQuestStatus.COMPLETED
                userQuestRepository.save(existing)
            } else {
                userQuestRepository.save(
                    UserQuest(userId = userId, questId = questId, status = UserQuestStatus.COMPLETED)
                )
            }
        }

        // Записываем подтверждённый снимок (в т.ч. для ленты)
        completedQuestRepository.save(
            CompletedQuest(
                userId = userId,
                questId = questId ?: 0,
                photo = objectKey,
                description = description ?: quest?.name,
                allowFeedPhotos = allowFeedPhotos,
            )
        )

        // Начисляем награду
        val reward = quest?.reward ?: BigDecimal.ZERO
        if (reward > BigDecimal.ZERO) {
            user.balance = user.balance.add(reward)
        }

        // Обновляем стрик/активность
        statsService.recordActivity(userId, user)

        userRepository.save(user)
        logger.info("Quest {} completed by user {}, credited {}", questId, userId, reward)
        return true
    }
}
