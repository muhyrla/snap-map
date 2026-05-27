package com.snapmap.controller

import com.snapmap.service.LeaderboardService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/leaderboard")
class LeaderboardController(
    private val leaderboardService: LeaderboardService
) {

    @GetMapping
    fun getLeaderboard(
        @RequestHeader(name = "Authorization", required = false) auth: String?,
        @RequestParam(name = "scope", defaultValue = "global") scope: String
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Unauthorized"))

        return try {
            val entries = when (scope.lowercase()) {
                "local"  -> leaderboardService.getLocal(initData)
                else     -> leaderboardService.getGlobal(initData)
            }
            ResponseEntity.ok(entries)
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error: ${e.message}"))
        }
    }

    private fun extractInitData(header: String?): String? {
        if (header.isNullOrBlank()) return null
        val parts = header.split(" ", limit = 2)
        return if (parts.size == 2 && parts[0].equals("tma", ignoreCase = true)) parts[1] else null
    }
}
