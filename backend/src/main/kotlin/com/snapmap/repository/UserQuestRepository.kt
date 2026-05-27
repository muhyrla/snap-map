package com.snapmap.repository

import com.snapmap.model.UserQuest
import com.snapmap.model.UserQuestStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserQuestRepository : JpaRepository<UserQuest, Long> {
    fun findByUserIdAndQuestId(userId: Long, questId: Long): UserQuest?
    fun existsByUserIdAndQuestIdAndStatus(userId: Long, questId: Long, status: UserQuestStatus): Boolean
    fun findAllByUserIdAndStatus(userId: Long, status: UserQuestStatus): List<UserQuest>
}
