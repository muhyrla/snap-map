package com.snapmap.security

import org.springframework.stereotype.Component
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.time.Instant
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Component
class TelegramInitDataValidator {

    sealed class InitDataResult {
        data class Valid(val data: Map<String, String>) : InitDataResult()
        data class Invalid(val reason: String) : InitDataResult()
    }

    fun validate(rawInitData: String, botToken: String, expiresInSeconds: Long = 3600): InitDataResult {
        val params = parseQueryString(rawInitData)

        val hash = params["hash"] ?: return InitDataResult.Invalid("Hash parameter is missing")
        val authDate = params["auth_date"]?.toLongOrNull()
            ?: return InitDataResult.Invalid("auth_date parameter is missing or invalid")

        if (expiresInSeconds > 0 && Instant.now().epochSecond - authDate > expiresInSeconds) {
            return InitDataResult.Invalid("Init data expired")
        }

        val dataCheckString = params
            .filter { (key, _) -> key != "hash" }
            .map { (key, value) -> "$key=$value" }
            .sorted()
            .joinToString("\n")

        val secretKey = hmacSha256("WebAppData".toByteArray(), botToken.toByteArray())
        val computedHash = hmacSha256(secretKey, dataCheckString.toByteArray())
            .joinToString("") { "%02x".format(it) }

        return if (computedHash.equals(hash, ignoreCase = true)) {
            InitDataResult.Valid(params)
        } else {
            InitDataResult.Invalid("Invalid signature")
        }
    }

    private fun parseQueryString(query: String): Map<String, String> =
        query.split('&').mapNotNull { pair ->
            val parts = pair.split('=', limit = 2)
            if (parts.size == 2) {
                runCatching {
                    val key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8.name())
                    val value = URLDecoder.decode(parts[1], StandardCharsets.UTF_8.name())
                    key to value
                }.getOrNull()
            } else null
        }.toMap()

    private fun hmacSha256(key: ByteArray, data: ByteArray): ByteArray {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(key, "HmacSHA256"))
        return mac.doFinal(data)
    }
}

