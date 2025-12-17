package com.snapmap.repository

import com.snapmap.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByTgId(tgId: Long): Optional<User>
}

