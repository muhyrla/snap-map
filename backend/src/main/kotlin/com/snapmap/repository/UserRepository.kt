package com.snapmap.repository

import com.snapmap.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, Long> {

    fun findByTgId(tgId: Long): Optional<User>

    @Query(value = """
        SELECT u.id, COALESCE(u.tg_username, u.tg_fullname, 'Аноним') AS name, COUNT(cq.id) AS snaps
        FROM users u
        LEFT JOIN completed_quests cq ON cq.user_id = u.id
        GROUP BY u.id
        ORDER BY snaps DESC
        LIMIT :limit
    """, nativeQuery = true)
    fun findGlobalLeaderboard(@Param("limit") limit: Int): List<Array<Any>>

    @Query(value = """
        SELECT u.id, COALESCE(u.tg_username, u.tg_fullname, 'Аноним') AS name, COUNT(cq.id) AS snaps
        FROM users u
        LEFT JOIN completed_quests cq ON cq.user_id = u.id
        WHERE u.city = :city
        GROUP BY u.id
        ORDER BY snaps DESC
        LIMIT :limit
    """, nativeQuery = true)
    fun findLocalLeaderboard(@Param("city") city: String, @Param("limit") limit: Int): List<Array<Any>>
}

