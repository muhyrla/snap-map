package com.snapmap.controller

import com.snapmap.service.StatsService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/me")
class StatsController(
    private val statsService: StatsService
) {

    @GetMapping("/stats")
    fun getStats(
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        val initData = extractInitData(authorizationHeader)
            ?: return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Authorization header is missing or invalid"))

        return try {
            val stats = statsService.getUserStats(initData)
            ResponseEntity.ok(mapOf(
                "streak"      to stats.streak,
                "daily_count" to stats.dailyCount,
                "daily_done"  to stats.dailyDone,
                "daily_total" to stats.dailyTotal,
                "quests_done" to stats.questsDone
            ))
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
