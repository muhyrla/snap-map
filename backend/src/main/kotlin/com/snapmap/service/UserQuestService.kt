package com.snapmap.service

import com.snapmap.model.Quest
import com.snapmap.model.QuestType
import com.snapmap.model.UserQuest
import com.snapmap.model.UserQuestStatus
import com.snapmap.repository.QuestRepository
import com.snapmap.repository.UserQuestRepository
import com.snapmap.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class UserQuestService(
    private val questRepository: QuestRepository,
    private val userQuestRepository: UserQuestRepository,
    private val userRepository: UserRepository,
    private val userService: UserService
) {
    data class QuestDto(
        val id: Long,
        val name: String,
        val type: String,
        val emoji: String?,
        val description: String?,
        val difficulty: Int?,
        val reward: Int,
        val expectedLabel: String?,
        val isCompleted: Boolean,
        val isSkipped: Boolean
    )

    data class RerollsDto(val rerollsLeft: Int)

    fun getQuestsByType(initData: String, type: QuestType): List<QuestDto> {
        val user = userService.createOrUpdateUser(initData)
        val userId = user.id!!
        val quests = questRepository.findAllByType(type)

        val completedIds = userQuestRepository
            .findAllByUserIdAndStatus(userId, UserQuestStatus.COMPLETED)
            .map { it.questId }.toSet()
        val skippedIds = userQuestRepository
            .findAllByUserIdAndStatus(userId, UserQuestStatus.SKIPPED)
            .map { it.questId }.toSet()

        return quests.map { q ->
            QuestDto(
                id          = q.id!!,
                name        = q.name,
                type        = q.type.name.lowercase(),
                emoji       = q.emoji,
                description = q.description,
                difficulty  = q.difficulty,
                reward      = q.reward?.toInt() ?: 0,
                expectedLabel = q.metadata,
                isCompleted = q.id in completedIds,
                isSkipped   = q.id in skippedIds
            )
        }
    }

    fun getQuestById(initData: String, questId: Long): QuestDto {
        val user = userService.createOrUpdateUser(initData)
        val userId = user.id!!
        val quest = questRepository.findById(questId)
            .orElseThrow { IllegalArgumentException("Quest $questId not found") }

        return QuestDto(
            id          = quest.id!!,
            name        = quest.name,
            type        = quest.type.name.lowercase(),
            emoji       = quest.emoji,
            description = quest.description,
            difficulty  = quest.difficulty,
            reward      = quest.reward?.toInt() ?: 0,
            expectedLabel = quest.metadata,
            isCompleted = userQuestRepository.existsByUserIdAndQuestIdAndStatus(userId, questId, UserQuestStatus.COMPLETED),
            isSkipped   = userQuestRepository.existsByUserIdAndQuestIdAndStatus(userId, questId, UserQuestStatus.SKIPPED)
        )
    }

    @Transactional
    fun skipQuest(initData: String, questId: Long) {
        val user = userService.createOrUpdateUser(initData)
        val userId = user.id!!

        if (!questRepository.existsById(questId)) {
            throw IllegalArgumentException("Quest $questId not found")
        }

        val existing = userQuestRepository.findByUserIdAndQuestId(userId, questId)
        if (existing != null) {
            existing.status = UserQuestStatus.SKIPPED
            userQuestRepository.save(existing)
        } else {
            userQuestRepository.save(UserQuest(userId = userId, questId = questId, status = UserQuestStatus.SKIPPED))
        }
    }

    @Transactional
    fun rerollQuest(initData: String, currentQuestId: Long): QuestDto {
        val user = userService.createOrUpdateUser(initData)
        val today = LocalDate.now()

        // Сброс реролов если новый день
        if (user.rerollsResetDate != today) {
            user.rerollsLeft = 3
            user.rerollsResetDate = today
        }

        if (user.rerollsLeft <= 0) {
            throw IllegalStateException("No rerolls left today")
        }

        val current = questRepository.findById(currentQuestId)
            .orElseThrow { IllegalArgumentException("Quest $currentQuestId not found") }

        val candidates = questRepository.findAllByTypeAndIdNot(current.type, currentQuestId)
        if (candidates.isEmpty()) {
            throw IllegalStateException("No other quests available for reroll")
        }

        user.rerollsLeft--
        userRepository.save(user)

        val next = candidates.random()
        return QuestDto(
            id          = next.id!!,
            name        = next.name,
            type        = next.type.name.lowercase(),
            emoji       = next.emoji,
            description = next.description,
            difficulty  = next.difficulty,
            reward      = next.reward?.toInt() ?: 0,
            expectedLabel = next.metadata,
            isCompleted = false,
            isSkipped   = false
        )
    }

    fun getRerolls(initData: String): RerollsDto {
        val user = userService.createOrUpdateUser(initData)
        val today = LocalDate.now()
        val rerollsLeft = if (user.rerollsResetDate != today) 3 else user.rerollsLeft
        return RerollsDto(rerollsLeft)
    }
}
