package com.snapmap.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.snapmap.model.User
import com.snapmap.model.UserRole
import com.snapmap.repository.UserRepository
import com.snapmap.security.TelegramInitDataValidator
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class UserService(
    private val userRepository: UserRepository,
    private val authService: TelegramAuthService
) {
    private val objectMapper = jacksonObjectMapper()

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class TelegramUser(
        val id: Long,
        val username: String? = null,
        val first_name: String? = null,
        val last_name: String? = null,
        val photo_url: String? = null
    )

    @Transactional
    fun createOrUpdateUser(initData: String): User {
        val validationResult = authService.verify(initData)
        
        val validatedData = when (validationResult) {
            is TelegramInitDataValidator.InitDataResult.Valid -> validationResult.data
            is TelegramInitDataValidator.InitDataResult.Invalid -> 
                throw IllegalArgumentException("Invalid initData: ${validationResult.reason}")
        }

        val userJson = validatedData["user"] 
            ?: throw IllegalArgumentException("User data not found in initData")
        
        val telegramUser: TelegramUser = try {
            objectMapper.readValue(userJson)
        } catch (e: Exception) {
            throw IllegalArgumentException("Failed to parse user data: ${e.message}", e)
        }

        val existingUser = userRepository.findByTgId(telegramUser.id)
        
        val fullName = buildString {
            telegramUser.first_name?.let { append(it) }
            telegramUser.last_name?.let { append(" $it") }
        }.takeIf { it.isNotBlank() }?.trim()

        return if (existingUser.isPresent) {
            val user = existingUser.get()
            
            val needsUpdate = user.tgUsername != telegramUser.username ||
                    user.tgAvatar != telegramUser.photo_url ||
                    user.tgFullname != fullName

            if (needsUpdate) {
                user.tgUsername = telegramUser.username
                user.tgAvatar = telegramUser.photo_url
                user.tgFullname = fullName
                userRepository.save(user)
            }
            user
        } else {
            val newUser = User(
                tgId = telegramUser.id,
                tgUsername = telegramUser.username,
                tgAvatar = telegramUser.photo_url,
                tgFullname = fullName,
                balance = BigDecimal.ZERO,
                role = UserRole.USER
            )
            userRepository.save(newUser)
        }
    }
}

