package com.snapmap.controller

import com.snapmap.service.UserService
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class AuthController(
    private val userService: UserService
) {

    data class OnboardingRequest(
        @field:NotBlank val city: String
    )

    @GetMapping("/me")
    fun getMe(
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        val initData = extractInitData(authorizationHeader)
            ?: return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Authorization header is missing or invalid"))

        return try {
            val user = userService.createOrUpdateUser(initData)
            ResponseEntity.ok(mapOf(
                "id"           to user.id,
                "tg_id"        to user.tgId,
                "tg_username"  to user.tgUsername,
                "tg_avatar"    to user.tgAvatar,
                "tg_fullname"  to user.tgFullname,
                "city"         to user.city,
                "balance"      to user.balance,
                "onboarded"    to user.onboarded,
                "role"         to user.role.name
            ))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(mapOf("error" to "Internal server error: ${e.message}"))
        }
    }

    @PatchMapping("/me")
    fun updateMe(
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?,
        @RequestBody @Valid body: OnboardingRequest
    ): ResponseEntity<Any> {
        val initData = extractInitData(authorizationHeader)
            ?: return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(mapOf("error" to "Authorization header is missing or invalid"))

        return try {
            val user = userService.completeOnboarding(initData, body.city)
            ResponseEntity.ok(mapOf(
                "id"        to user.id,
                "city"      to user.city,
                "onboarded" to user.onboarded
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

