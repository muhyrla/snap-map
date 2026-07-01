package com.snapmap.service

import com.snapmap.model.QuestType
import com.snapmap.repository.CompletedQuestRepository
import com.snapmap.repository.QuestRepository
import com.snapmap.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class FeedService(
    private val completedQuestRepository: CompletedQuestRepository,
    private val userRepository: UserRepository,
    private val questRepository: QuestRepository,
    private val storageService: StorageService,
) {
    data class FeedItemDto(
        val id: Long,
        val name: String,
        val city: String,
        val time: String,
        val avatar: String,
        val image: String,
        val quest: String,
        val questColor: String,
        val caption: String,
        val likes: Int,
        val liked: Boolean,
        val comments: Int,
    )

    fun getFeed(limit: Int = 30): List<FeedItemDto> {
        val completed = completedQuestRepository
            .findAllByAllowFeedPhotosTrueOrderByIdDesc(PageRequest.of(0, limit))
        if (completed.isEmpty()) return emptyList()

        val users = userRepository.findAllById(completed.map { it.userId }.toSet())
            .associateBy { it.id }
        val quests = questRepository.findAllById(completed.mapNotNull { it.questId.takeIf { q -> q != 0L } }.toSet())
            .associateBy { it.id }

        return completed.map { cq ->
            val user = users[cq.userId]
            val quest = quests[cq.questId]
            val name = user?.tgUsername ?: user?.tgFullname ?: "Аноним"
            FeedItemDto(
                id = cq.id!!,
                name = name,
                city = user?.city ?: "",
                time = relativeTime(cq.completedAt),
                avatar = avatarColor(name),
                image = "url(\"${storageService.publicUrl(cq.photo ?: "")}\")",
                quest = quest?.name ?: (cq.description ?: "Снэп"),
                questColor = questColor(quest?.type),
                caption = cq.description ?: "",
                likes = 0,
                liked = false,
                comments = 0,
            )
        }
    }

    private fun questColor(type: QuestType?): String = when (type) {
        QuestType.DAILY -> "green"
        QuestType.WEEKLY -> "orange"
        QuestType.SPECIAL -> "purple"
        null -> "green"
    }

    private val avatarPalette = listOf("#FF9500", "#34C759", "#AF52DE", "#007AFF", "#DE1A1A")
    private fun avatarColor(seed: String): String =
        avatarPalette[Math.floorMod(seed.hashCode(), avatarPalette.size)]

    private fun relativeTime(date: LocalDate): String {
        val days = ChronoUnit.DAYS.between(date, LocalDate.now())
        return when {
            days <= 0L -> "сегодня"
            days == 1L -> "вчера"
            else -> "$days д назад"
        }
    }
}
