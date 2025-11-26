package com.snapmap.service

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.ObjectMapper
import com.snapmap.model.User
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.data.redis.core.StringRedisTemplate
import java.time.Duration
import java.time.Instant
import java.util.UUID

@Service
class VerificationQueueService(
	private val redisTemplate: StringRedisTemplate,
	private val objectMapper: ObjectMapper,
	private val storageService: StorageService,
	@Value("\${s3.bucket}") private val bucket: String,
	@Value("\${redis.queue-key}") private val queueKey: String,
	@Value("\${redis.status-key-prefix}") private val statusKeyPrefix: String,
	@Value("\${redis.result-key-prefix}") private val resultKeyPrefix: String,
	@Value("\${redis.task-ttl-seconds:86400}") private val taskTtlSeconds: Long,
) {

	companion object {
		private val logger = LoggerFactory.getLogger(VerificationQueueService::class.java)
	}

	enum class VerificationState {
		QUEUED,
		PROCESSING,
		APPROVED,
		REJECTED,
		FAILED
	}

	data class VerificationTaskPayload(
		val taskId: String,
		val bucket: String,
		val objectKey: String,
		val expectedLabel: String,
		val eTag: String,
		val userId: Long,
		val userTgId: Long,
		val questId: Long?,
		val allowFeedPhotos: Boolean,
		val requestedAtEpochMillis: Long,
	)

	data class VerificationStatus(
		val taskId: String,
		val state: VerificationState,
		val userId: Long,
		val objectKey: String,
		val message: String?,
		val updatedAtEpochMillis: Long,
	)

	data class VerificationEnqueueResult(
		val taskId: String,
		val status: VerificationStatus
	)

	fun enqueueVerification(
		user: User,
		objectKey: String,
		expectedLabel: String,
		questId: Long?,
		allowFeedPhotos: Boolean
	): VerificationEnqueueResult {
		val normalizedObjectKey = objectKey.trim()
		require(normalizedObjectKey.isNotBlank()) { "objectKey must not be blank" }
		val userId = user.id ?: throw IllegalStateException("User entity is not persisted yet")

		val objectStatus = storageService.getObjectStatus(normalizedObjectKey)
		if (!objectStatus.exists || objectStatus.eTag.isNullOrBlank()) {
			throw IllegalArgumentException("Object $normalizedObjectKey not found in storage")
		}

		val taskId = UUID.randomUUID().toString()
		val payload = VerificationTaskPayload(
			taskId = taskId,
			bucket = bucket,
			objectKey = normalizedObjectKey,
			expectedLabel = expectedLabel,
			eTag = objectStatus.eTag!!,
			userId = userId,
			userTgId = user.tgId,
			questId = questId,
			allowFeedPhotos = allowFeedPhotos,
			requestedAtEpochMillis = Instant.now().toEpochMilli()
		)

		val payloadJson = objectMapper.writeValueAsString(payload)
		redisTemplate.opsForList().leftPush(queueKey, payloadJson)
		logger.info("Queued verification task {} for user {}", taskId, userId)

		val status = VerificationStatus(
			taskId = taskId,
			state = VerificationState.QUEUED,
			userId = userId,
			objectKey = normalizedObjectKey,
			message = "Task queued",
			updatedAtEpochMillis = Instant.now().toEpochMilli()
		)
		saveStatus(status)

		return VerificationEnqueueResult(taskId = taskId, status = status)
	}

	fun getStatusForUser(taskId: String, userId: Long): VerificationStatus? {
		val status = getStatus(taskId) ?: return null
		return if (status.userId == userId) status else null
	}

	fun getStatus(taskId: String): VerificationStatus? {
		val raw = redisTemplate.opsForValue().get(statusKey(taskId)) ?: return null
		return try {
			objectMapper.readValue(raw, VerificationStatus::class.java)
		} catch (ex: JsonProcessingException) {
			logger.error("Failed to deserialize status for task {}", taskId, ex)
			null
		}
	}

	fun saveStatus(status: VerificationStatus) {
		val duration = Duration.ofSeconds(taskTtlSeconds)
		val key = statusKey(status.taskId)
		val json = objectMapper.writeValueAsString(status)
		redisTemplate.opsForValue().set(key, json, duration)
	}

	fun saveResult(taskId: String, resultPayload: Any) {
		val duration = Duration.ofSeconds(taskTtlSeconds)
		val json = objectMapper.writeValueAsString(resultPayload)
		redisTemplate.opsForValue().set(resultKey(taskId), json, duration)
	}

	fun getResult(taskId: String): String? =
		redisTemplate.opsForValue().get(resultKey(taskId))

	private fun statusKey(taskId: String) = "$statusKeyPrefix:$taskId"
	private fun resultKey(taskId: String) = "$resultKeyPrefix:$taskId"
}


