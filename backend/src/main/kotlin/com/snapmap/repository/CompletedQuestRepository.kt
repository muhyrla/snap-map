package com.snapmap.repository

import com.snapmap.model.CompletedQuest
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface CompletedQuestRepository : JpaRepository<CompletedQuest, Long> {
    fun countByUserId(userId: Long): Long
    fun countByUserIdAndCompletedAt(userId: Long, completedAt: LocalDate): Long
}
