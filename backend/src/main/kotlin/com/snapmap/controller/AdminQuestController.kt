package com.snapmap.controller

import com.snapmap.model.Quest
import com.snapmap.security.AdminSecurityHelper
import com.snapmap.service.QuestService
import com.snapmap.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/admin/quests")
class AdminQuestController(
    private val questService: QuestService,
    private val userService: UserService
) {

    @GetMapping
    fun getAllQuests(
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(authorizationHeader, userService)
        
        val quests = questService.findAll()
        return ResponseEntity.ok(quests.map { questToDto(it) })
    }

    @GetMapping("/{id}")
    fun getQuestById(
        @PathVariable id: Long,
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(authorizationHeader, userService)
        
        val quest = questService.findById(id)
            ?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to "Quest with id $id not found"))
        
        return ResponseEntity.ok(questToDto(quest))
    }

    @PostMapping
    fun createQuest(
        @RequestBody questDto: QuestDto,
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(authorizationHeader, userService)
        
        val quest = Quest(
            name = questDto.name,
            metadata = questDto.metadata,
            difficulty = questDto.difficulty,
            reward = questDto.reward,
            durationDays = questDto.durationDays
        )
        
        val result = questService.create(quest)
        
        return if (result.isDuplicate) {
            ResponseEntity.status(HttpStatus.OK).body(mapOf(
                "id" to result.quest.id,
                "message" to "Already exist"
            ))
        } else {
            ResponseEntity.status(HttpStatus.CREATED).body(questToDto(result.quest))
        }
    }

    @PatchMapping("/{id}")
    fun updateQuest(
        @PathVariable id: Long,
        @RequestBody questPatchDto: QuestPatchDto,
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(authorizationHeader, userService)
        
        return try {
            val updatedQuest = questService.partialUpdate(
                id = id,
                name = questPatchDto.name,
                metadata = questPatchDto.metadata,
                difficulty = questPatchDto.difficulty,
                reward = questPatchDto.reward,
                durationDays = questPatchDto.durationDays
            )
            ResponseEntity.ok(questToDto(updatedQuest))
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to e.message))
        }
    }

    @DeleteMapping("/{id}")
    fun deleteQuest(
        @PathVariable id: Long,
        @RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
    ): ResponseEntity<Any> {
        AdminSecurityHelper.checkAdminAccess(authorizationHeader, userService)
        
        return try {
            questService.delete(id)
            ResponseEntity.noContent().build()
        } catch (e: IllegalArgumentException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(mapOf("error" to e.message))
        }
    }

    private fun questToDto(quest: Quest): Map<String, Any?> {
        return mapOf(
            "id" to quest.id,
            "name" to quest.name,
            "metadata" to quest.metadata,
            "difficulty" to quest.difficulty,
            "reward" to quest.reward,
            "duration_days" to quest.durationDays
        )
    }

    data class QuestDto(
        val name: String,
        val metadata: String? = null,
        val difficulty: Int? = null,
        val reward: BigDecimal? = null,
        val durationDays: Int? = null
    )
    
    data class QuestPatchDto(
        val name: String? = null,
        val metadata: String? = null,
        val difficulty: Int? = null,
        val reward: BigDecimal? = null,
        val durationDays: Int? = null
    )
}

