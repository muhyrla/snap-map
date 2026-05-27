package com.snapmap.service

import com.snapmap.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class LeaderboardService(
    private val userRepository: UserRepository,
    private val userService: UserService
) {
    companion object {
        const val PAGE_SIZE = 50
    }

    data class LeaderboardEntry(
        val rank: Int,
        val name: String,
        val snaps: Long,
        val isMe: Boolean
    )

    fun getGlobal(initData: String): List<LeaderboardEntry> {
        val me = userService.createOrUpdateUser(initData)
        val rows = userRepository.findGlobalLeaderboard(PAGE_SIZE)
        return rows.mapIndexed { index, row ->
            val id   = (row[0] as Number).toLong()
            val name = row[1] as String
            val snaps = (row[2] as Number).toLong()
            LeaderboardEntry(rank = index + 1, name = name, snaps = snaps, isMe = id == me.id)
        }
    }

    fun getLocal(initData: String): List<LeaderboardEntry> {
        val me = userService.createOrUpdateUser(initData)
        val city = me.city
            ?: return emptyList()
        val rows = userRepository.findLocalLeaderboard(city, PAGE_SIZE)
        return rows.mapIndexed { index, row ->
            val id    = (row[0] as Number).toLong()
            val name  = row[1] as String
            val snaps = (row[2] as Number).toLong()
            LeaderboardEntry(rank = index + 1, name = name, snaps = snaps, isMe = id == me.id)
        }
    }
}
