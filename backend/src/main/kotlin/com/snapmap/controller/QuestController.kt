package com.snapmap.controller

import com.snapmap.model.QuestType
import com.snapmap.service.UserQuestService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/quests")
class QuestController(
    private val userQuestService: UserQuestService
) {

    @GetMapping
    fun getQuests(
        @RequestHeader(name = "Authorization", required = false) auth: String?,
        @RequestParam(name = "type", defaultValue = "daily") type: String
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth)
            ?: return unauthorized()

        val questType = runCatching { QuestType.valueOf(type.uppercase()) }.getOrNull()
            ?: return ResponseEntity.badRequest().body(mapOf("error" to "Invalid type. Use: daily, weekly, special"))

        return try {
            ResponseEntity.ok(userQuestService.getQuestsByType(initData, questType))
        } catch (e: IllegalArgumentException) {
            unauthorized(e.message)
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    @GetMapping("/{id}")
    fun getQuest(
        @RequestHeader(name = "Authorization", required = false) auth: String?,
        @PathVariable id: Long
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth) ?: return unauthorized()
        return try {
            ResponseEntity.ok(userQuestService.getQuestById(initData, id))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    @PostMapping("/{id}/skip")
    fun skipQuest(
        @RequestHeader(name = "Authorization", required = false) auth: String?,
        @PathVariable id: Long
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth) ?: return unauthorized()
        return try {
            userQuestService.skipQuest(initData, id)
            ResponseEntity.ok(mapOf("ok" to true))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    @PostMapping("/reroll")
    fun rerollQuest(
        @RequestHeader(name = "Authorization", required = false) auth: String?,
        @RequestBody body: RerollRequest
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth) ?: return unauthorized()
        return try {
            ResponseEntity.ok(userQuestService.rerollQuest(initData, body.currentQuestId))
        } catch (e: IllegalStateException) {
            ResponseEntity.status(HttpStatus.CONFLICT).body(mapOf("error" to e.message))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    @GetMapping("/rerolls")
    fun getRerolls(
        @RequestHeader(name = "Authorization", required = false) auth: String?
    ): ResponseEntity<Any> {
        val initData = extractInitData(auth) ?: return unauthorized()
        return try {
            ResponseEntity.ok(userQuestService.getRerolls(initData))
        } catch (e: Exception) {
            serverError(e.message)
        }
    }

    data class RerollRequest(val currentQuestId: Long)

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
