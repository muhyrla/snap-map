package com.snapmap.controller

import com.snapmap.service.MarketService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/market")
class MarketController(
    private val marketService: MarketService
) {

    @GetMapping
    fun getItems(
        @RequestHeader(name = "Authorization", required = false) auth: String?,
        @RequestParam(name = "category", required = false) category: String?
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth) ?: return unauthorized()
        return try {
            ResponseEntity.ok(marketService.getItems(initData, category))
        } catch (e: IllegalArgumentException) {
            unauthorized(e.message)
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    @PostMapping("/{id}/purchase")
    fun purchase(
        @RequestHeader(name = "Authorization", required = false) auth: String?,
        @PathVariable id: Long
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth) ?: return unauthorized()
        return try {
            ResponseEntity.ok(marketService.purchase(initData, id))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    @GetMapping("/purchases")
    fun getPurchases(
        @RequestHeader(name = "Authorization", required = false) auth: String?
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth) ?: return unauthorized()
        return try {
            ResponseEntity.ok(marketService.getPurchases(initData))
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    private fun extractInitData(header: String?): String? {
        if (header.isNullOrBlank()) return null
        val parts = header.split(" ", limit = 2)
        return if (parts.size == 2 && parts[0].equals("tma", ignoreCase = true)) parts[1] else null
    }

    private fun unauthorized(msg: String? = null): ResponseEntity<Any> =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mapOf("error" to (msg ?: "Unauthorized")))

    private fun serverError(msg: String?): ResponseEntity<Any> =
        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Internal server error: $msg"))
}
