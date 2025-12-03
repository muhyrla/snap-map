package com.snapmap.repository

import com.snapmap.model.VerificationResult
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface VerificationResultRepository : JpaRepository<VerificationResult, Long>
