package com.snapmap.repository

import com.snapmap.model.Quest
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface QuestRepository : JpaRepository<Quest, Long> {
    
    fun findByName(name: String): Optional<Quest>
    
    @Query("SELECT q FROM Quest q WHERE q.metadata = :metadata AND q.metadata IS NOT NULL")
    fun findByMetadata(@Param("metadata") metadata: String): Optional<Quest>
}

