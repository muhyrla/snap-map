package com.example.snapmap.api

import com.example.snapmap.security.TelegramAuthFilter
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestAttribute
import org.springframework.web.bind.annotation.RestController

@RestController
class WhoAmIController {

    @GetMapping("/me")
    fun whoAmI(
        @RequestAttribute(name = TelegramAuthFilter.INIT_DATA_ATTR) initData: Map<String, String>
    ): ResponseEntity<Map<String, Any>> {
        val response = linkedMapOf<String, Any>(
            "ok" to true,
            "initData" to initData,
        )
        return ResponseEntity.ok(response)
    }
}


