package com.snapmap.service

import com.snapmap.model.Quest
import com.snapmap.repository.QuestRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class QuestService(
    private val questRepository: QuestRepository
) {
    
    fun findAll(): List<Quest> {
        return questRepository.findAll()
    }
    
    fun findById(id: Long): Quest? {
        return questRepository.findById(id).orElse(null)
    }
    
    data class CreateQuestResult(
        val quest: Quest,
        val isDuplicate: Boolean
    )
    
    @Transactional
    fun create(quest: Quest): CreateQuestResult {
        val existingByName = questRepository.findByName(quest.name)
        if (existingByName.isPresent) {
            return CreateQuestResult(existingByName.get(), isDuplicate = true)
        }
        
        val metadata = quest.metadata
        if (!metadata.isNullOrBlank()) {
            val existingByMetadata = questRepository.findByMetadata(metadata)
            if (existingByMetadata.isPresent) {
                return CreateQuestResult(existingByMetadata.get(), isDuplicate = true)
            }
        }
        
        return try {
            val newQuest = questRepository.save(quest)
            CreateQuestResult(newQuest, isDuplicate = false)
        } catch (e: DataIntegrityViolationException) {
            val existingByName = questRepository.findByName(quest.name)
            if (existingByName.isPresent) {
                return CreateQuestResult(existingByName.get(), isDuplicate = true)
            }
            
            val metadata = quest.metadata
            if (!metadata.isNullOrBlank()) {
                val existingByMetadata = questRepository.findByMetadata(metadata)
                if (existingByMetadata.isPresent) {
                    return CreateQuestResult(existingByMetadata.get(), isDuplicate = true)
                }
            }
            
            throw e
        }
    }
    
    @Transactional
    fun partialUpdate(
        id: Long,
        name: String? = null,
        metadata: String? = null,
        difficulty: Int? = null,
        reward: BigDecimal? = null,
        durationDays: Int? = null
    ): Quest {
        val existingQuest = questRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Quest with id $id not found") }
        
        name?.let { newName ->
            val questWithSameName = questRepository.findByName(newName)
            if (questWithSameName.isPresent && questWithSameName.get().id != id) {
                throw IllegalArgumentException("Quest with name '$newName' already exists")
            }
            existingQuest.name = newName
        }
        
        metadata?.let { newMetadata ->
            val questWithSameMetadata = questRepository.findByMetadata(newMetadata)
            if (questWithSameMetadata.isPresent && questWithSameMetadata.get().id != id) {
                throw IllegalArgumentException("Quest with this metadata already exists")
            }
            existingQuest.metadata = newMetadata
        }
        
        difficulty?.let { existingQuest.difficulty = it }
        reward?.let { rewardValue -> existingQuest.reward = rewardValue }
        durationDays?.let { existingQuest.durationDays = it }
        
        return try {
            questRepository.save(existingQuest)
        } catch (e: DataIntegrityViolationException) {
            if (name != null) {
                val questWithSameName = questRepository.findByName(name)
                if (questWithSameName.isPresent && questWithSameName.get().id != id) {
                    throw IllegalArgumentException("Quest with name '$name' already exists")
                }
            }
            if (metadata != null && !metadata.isBlank()) {
                val questWithSameMetadata = questRepository.findByMetadata(metadata)
                if (questWithSameMetadata.isPresent && questWithSameMetadata.get().id != id) {
                    throw IllegalArgumentException("Quest with this metadata already exists")
                }
            }
            throw e
        }
    }
    
    @Transactional
    fun delete(id: Long) {
        if (!questRepository.existsById(id)) {
            throw IllegalArgumentException("Quest with id $id not found")
        }
        questRepository.deleteById(id)
    }
}

