package com.snapmap.service

import com.snapmap.repository.CompletedQuestRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class StatsService(
    private val userService: UserService,
    private val completedQuestRepository: CompletedQuestRepository
) {
    companion object {
        const val DAILY_TOTAL = 4
    }

    data class UserStats(
        val streak: Int,
        val dailyCount: Long,
        val dailyDone: Long,
        val dailyTotal: Int,
        val questsDone: Long
    )

    fun getUserStats(initData: String): UserStats {
        val user = userService.createOrUpdateUser(initData)
        val userId = user.id!!
        val today = LocalDate.now()

        val questsDone = completedQuestRepository.countByUserId(userId)
        val dailyCount = completedQuestRepository.countByUserIdAndCompletedAt(userId, today)
        val dailyDone  = minOf(dailyCount, DAILY_TOTAL.toLong())

        return UserStats(
            streak     = user.streak,
            dailyCount = dailyCount,
            dailyDone  = dailyDone,
            dailyTotal = DAILY_TOTAL,
            questsDone = questsDone
        )
    }

    // Вызывается при засчитывании квеста — обновляет стрик на User
    fun recordActivity(userId: Long, user: com.snapmap.model.User): com.snapmap.model.User {
        val today = LocalDate.now()
        val last  = user.lastActivityDate

        user.streak = when {
            last == null          -> 1
            last == today         -> user.streak          // уже был снэп сегодня
            last == today.minusDays(1) -> user.streak + 1 // вчера был снэп — продолжаем стрик
            else                  -> 1                    // пропуск — сбрасываем
        }
        user.lastActivityDate = today
        return user
    }
}
