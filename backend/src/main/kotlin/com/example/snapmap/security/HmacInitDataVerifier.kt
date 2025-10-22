package com.example.snapmap.security

import org.springframework.stereotype.Component
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Component
class HmacInitDataVerifier {
    fun verify(raw: String): Map<String, String> {
        val params = parseQueryString(raw)

        val hash = params["hash"] ?: error("hash is missing")
        val paramsToVerify = params.filterKeys { it != "hash" }

        val dataCheckString = paramsToVerify.toSortedMap()
            .map { (k, v) -> "$k=$v" }
            .joinToString("\n")

        val secretKey = hmacSha256(
            "WebAppData".toByteArray(StandardCharsets.UTF_8),
            "8138364282:AAHvQBOypEwZB-iVcPybZno_vaVvdkbRHPA".toByteArray(StandardCharsets.UTF_8)
        )
        val computedHash = hmacSha256Hex(
            secretKey,
            dataCheckString.toByteArray(StandardCharsets.UTF_8)
        )

        if (!computedHash.equals(hash, ignoreCase = true)) {
            error("invalid signature")
        }

        return paramsToVerify
    }

    private fun parseQueryString(query: String): Map<String, String> {
        if (query.isBlank()) return emptyMap()
        return query.split('&')
            .mapNotNull { pair ->
                val idx = pair.indexOf('=')
                if (idx <= 0) return@mapNotNull null
                val key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8.name())
                val value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8.name())
                key to value
            }
            .toMap()
    }

    private fun hmacSha256(key: ByteArray, data: ByteArray): ByteArray {
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(key, "HmacSHA256"))
        return mac.doFinal(data)
    }

    private fun hmacSha256Hex(key: ByteArray, data: ByteArray): String {
        val bytes = hmacSha256(key, data)
        return bytes.joinToString("") { b -> "%02x".format(b) }
    }
}


