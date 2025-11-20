package com.snapmap.controller

import com.fasterxml.jackson.annotation.JsonProperty
import com.snapmap.service.StorageService
import com.snapmap.service.UserService
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.net.URL
import java.security.SecureRandom
import java.time.LocalDate

@RestController
@RequestMapping("/api/uploads")
class UploadController(
	private val storageService: StorageService,
	private val userService: UserService
) {

	data class PresignRequest(
		@field:NotBlank
		@JsonProperty("object_to_find")
		val objectToFind: String,
		@JsonProperty("expiresInSeconds")
		val expiresInSeconds: Long? = 600
	)

	data class PresignResponse(
		@JsonProperty("url")
		val url: URL,
		@JsonProperty("objectKey")
		val objectKey: String? = null
	)

	@PostMapping("/presign")
	fun presign(
		@Validated @RequestBody req: PresignRequest,
		@RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
	): ResponseEntity<Any> {
		if (authorizationHeader.isNullOrBlank()) {
			return ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(mapOf("error" to "Authorization header is missing"))
		}
		val parts = authorizationHeader.split(" ", limit = 2)
		if (parts.size != 2 || !parts[0].equals("tma", ignoreCase = true)) {
			return ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(mapOf("error" to "Invalid Authorization header format. Expected 'tma <initData>'"))
		}
		val initData = parts[1]
		val user = try {
			userService.createOrUpdateUser(initData)
		} catch (e: IllegalArgumentException) {
			return ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(mapOf("error" to e.message))
		} catch (e: Exception) {
			return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(mapOf("error" to "Internal server error: ${e.message}"))
		}

		val hint = sanitizeSegment(req.objectToFind, maxLen = 48)
		val randomPart = randomBase62(16)
		val objectKey = "${randomPart}_${hint}_${user.tgId}"

		val url = storageService.generateUploadUrl(
			objectKey = objectKey,
			contentType = null,
			expiresInSeconds = req.expiresInSeconds ?: 600
		)
		return ResponseEntity.ok(PresignResponse(url = url, objectKey = objectKey))
	}

	data class StatusResponse(
		@JsonProperty("exists")
		val exists: Boolean,
		@JsonProperty("eTag")
		val eTag: String?,
		@JsonProperty("size")
		val size: Long?,
		@JsonProperty("lastModifiedEpochMilli")
		val lastModifiedEpochMilli: Long?,
	)

	@GetMapping("/status")
	fun status(@RequestParam("objectKey") objectKey: String): ResponseEntity<StatusResponse> {
		val s = storageService.getObjectStatus(objectKey)
		return ResponseEntity.ok(
			StatusResponse(
				exists = s.exists,
				eTag = s.eTag,
				size = s.size,
				lastModifiedEpochMilli = s.lastModifiedEpochMilli
			)
		)
	}

	private val random = SecureRandom()
	private val base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".toCharArray()

	private fun randomBase62(length: Int = 16): String {
		val sb = StringBuilder(length)
		repeat(length) {
			sb.append(base62[random.nextInt(base62.size)])
		}
		return sb.toString()
	}

	private fun sanitizeSegment(input: String, maxLen: Int = 48): String {
		val cleaned = input.lowercase()
			.replace(Regex("[^a-z0-9._-]+"), "-")
			.trim('-')
		return if (cleaned.length > maxLen) cleaned.substring(0, maxLen) else cleaned
	}

}


