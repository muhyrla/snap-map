package com.snapmap.repository

import com.snapmap.model.UserQuest
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserQuestRepository : JpaRepository<UserQuest, Long>

