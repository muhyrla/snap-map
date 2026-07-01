package com.snapmap.controller

import com.snapmap.service.FeedService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/feed")
class FeedController(
    private val feedService: FeedService
) {

    @GetMapping
    fun getFeed(
        @RequestParam(name = "limit", defaultValue = "30") limit: Int
    ): ResponseEntity<Any> {
        return try {
            val safeLimit = limit.coerceIn(1, 100)
            ResponseEntity.ok(feedService.getFeed(safeLimit))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error: ${e.message}"))
        }
    }
}
