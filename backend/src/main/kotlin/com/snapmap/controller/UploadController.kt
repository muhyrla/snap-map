package com.snapmap.controller

import com.fasterxml.jackson.annotation.JsonProperty
import com.snapmap.model.User
import com.snapmap.service.StorageService
import com.snapmap.service.UserService
import com.snapmap.service.VerificationQueueService
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
	private val userService: UserService,
	private val verificationQueueService: VerificationQueueService,
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
		val (user, errorResponse) = getUserOrErrorResponse(authorizationHeader)
		if (user == null) {
			return errorResponse!!
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

	data class VerificationRequest(
		@field:NotBlank
		val objectKey: String,
		@field:NotBlank
		val expectedLabel: String,
		val questId: Long? = null,
		val allowFeedPhotos: Boolean = false,
	)

	data class VerificationEnqueueResponse(
		@JsonProperty("taskId")
		val taskId: String,
		@JsonProperty("status")
		val status: VerificationQueueService.VerificationStatus
	)

	data class VerificationStatusResponse(
		@JsonProperty("taskId")
		val taskId: String,
		@JsonProperty("status")
		val status: VerificationQueueService.VerificationStatus
	)

	@PostMapping("/verify")
	fun requestVerification(
		@Validated @RequestBody req: VerificationRequest,
		@RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
	): ResponseEntity<Any> {
		val (user, errorResponse) = getUserOrErrorResponse(authorizationHeader)
		if (user == null) {
			return errorResponse!!
		}

		return try {
			val result = verificationQueueService.enqueueVerification(
				user = user,
				objectKey = req.objectKey,
				expectedLabel = req.expectedLabel,
				questId = req.questId,
				allowFeedPhotos = req.allowFeedPhotos
			)
			ResponseEntity.status(HttpStatus.ACCEPTED)
				.body(VerificationEnqueueResponse(taskId = result.taskId, status = result.status))
		} catch (e: IllegalArgumentException) {
			ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(mapOf("error" to e.message))
		} catch (e: Exception) {
			ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(mapOf("error" to "Unable to queue verification: ${e.message}"))
		}
	}

	@GetMapping("/verify/status")
	fun verificationStatus(
		@RequestParam("taskId") taskId: String,
		@RequestHeader(name = "Authorization", required = false) authorizationHeader: String?
	): ResponseEntity<Any> {
		val (user, errorResponse) = getUserOrErrorResponse(authorizationHeader)
		if (user == null) {
			return errorResponse!!
		}

		val userId = user.id ?: return ResponseEntity
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.body(mapOf("error" to "User is not persisted yet"))

		val status = verificationQueueService.getStatusForUser(taskId, userId)
			?: return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(mapOf("error" to "Task not found"))

		return ResponseEntity.ok(VerificationStatusResponse(taskId = taskId, status = status))
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

	private fun getUserOrErrorResponse(
		authorizationHeader: String?
	): Pair<User?, ResponseEntity<Any>?> {
		if (authorizationHeader.isNullOrBlank()) {
			return null to ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(mapOf("error" to "Authorization header is missing"))
		}
		val parts = authorizationHeader.split(" ", limit = 2)
		if (parts.size != 2 || !parts[0].equals("tma", ignoreCase = true)) {
			return null to ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(mapOf("error" to "Invalid Authorization header format. Expected 'tma <initData>'"))
		}
		val initData = parts[1]
		val user = try {
			userService.createOrUpdateUser(initData)
		} catch (e: IllegalArgumentException) {
			return null to ResponseEntity
				.status(HttpStatus.UNAUTHORIZED)
				.body(mapOf("error" to e.message))
		} catch (e: Exception) {
			return null to ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(mapOf("error" to "Internal server error: ${e.message}"))
		}
		return user to null
	}

}


