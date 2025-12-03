package com.snapmap.repository

import com.snapmap.model.VerificationStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface VerificationStatusRepository : JpaRepository<VerificationStatus, Long> {
    fun findByTaskIdAndUserId(taskId: String, userId: Long): VerificationStatus?
}
