package com.snapmap.controller

import com.snapmap.security.AdminSecurityHelper
import com.snapmap.service.MarketService
import com.snapmap.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/shop")
class AdminShopController(
    private val marketService: MarketService,
    private val userService: UserService
) {

    @GetMapping
    fun getAll(
        @RequestHeader(name = "Authorization", required = false) auth: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(auth, userService)
        return ResponseEntity.ok(marketService.adminFindAll())
    }

    @PostMapping
    fun create(
        @RequestBody body: MarketService.ShopItemInput,
        @RequestHeader(name = "Authorization", required = false) auth: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(auth, userService)
        return ResponseEntity.status(HttpStatus.CREATED).body(marketService.adminCreate(body))
    }

    @PatchMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody body: MarketService.ShopItemInput,
        @RequestHeader(name = "Authorization", required = false) auth: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(auth, userService)
        return try {
            ResponseEntity.ok(marketService.adminUpdate(id, body))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        }
    }

    @DeleteMapping("/{id}")
    fun delete(
        @PathVariable id: Long,
        @RequestHeader(name = "Authorization", required = false) auth: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(auth, userService)
        return try {
            marketService.adminDelete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        }
    }
}
