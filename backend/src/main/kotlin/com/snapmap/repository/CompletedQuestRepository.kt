package com.snapmap.repository

import com.snapmap.model.CompletedQuest
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CompletedQuestRepository : JpaRepository<CompletedQuest, Long>

