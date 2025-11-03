package com.snapmap.controller

import com.snapmap.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService
) {

    @GetMapping("/rerolls")
    fun getRerolls(
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        if (authorizationHeader.isNullOrBlank()) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Authorization header is missing"))
        }

        val parts = authorizationHeader.split(" ", limit = 2)
        if (parts.size != 2 || !parts[0].equals("tma", ignoreCase = true)) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Invalid Authorization header format. Expected 'tma <initData>'"))
        }

        val initData = parts[1]

        return try {
            val user = userService.createOrUpdateUser(initData)
            ResponseEntity.ok(mapOf("rerolls" to user.rerollCount))
        } catch (e: IllegalArgumentException) {
            ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error: ${e.message}"))
        }
    }
}


