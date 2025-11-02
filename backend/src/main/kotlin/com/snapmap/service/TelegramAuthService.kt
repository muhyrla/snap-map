package com.snapmap.service

import com.snapmap.security.TelegramInitDataValidator
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class TelegramAuthService(
    private val validator: TelegramInitDataValidator,
    @Value("\${telegram.bot-token:}") private val botToken: String
) {
    @PostConstruct
    fun init() {
        if (botToken.isBlank()) {
            throw IllegalStateException(
                "Telegram bot token is not set! " +
                "Please set environment variable SNAP_MAP_BOT_TOKEN"
            )
        }
    }

    /**
     * Проверяет initData из заголовка Authorization.
     */
    fun verify(initData: String): TelegramInitDataValidator.InitDataResult {
        return validator.validate(initData, botToken)
    }
}

