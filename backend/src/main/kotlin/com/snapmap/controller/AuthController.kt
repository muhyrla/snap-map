package com.snapmap.controller

import com.snapmap.service.TelegramAuthService
import com.snapmap.security.TelegramInitDataValidator
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class AuthController(
    private val authService: TelegramAuthService
) {

    @GetMapping("/me")
    fun getMe(
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
        val result = authService.verify(initData)

        return when (result) {
            is TelegramInitDataValidator.InitDataResult.Valid -> {
                ResponseEntity.ok(result.data)
            }
            is TelegramInitDataValidator.InitDataResult.Invalid -> {
                ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(mapOf("error" to result.reason))
            }
        }
    }
}

