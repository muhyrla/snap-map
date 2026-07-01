package com.snapmap.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.connection.Message
import org.springframework.data.redis.connection.MessageListener
import org.springframework.data.redis.core.StringRedisTemplate
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.RedisMessageListenerContainer
import org.springframework.stereotype.Component
import java.time.Duration

/**
 * Слушает Redis pub/sub канал moderation:events.
 * Когда воркер публикует VERIFICATION_COMPLETED — засчитываем квест.
 */
@Component
class VerificationEventListener(
    private val listenerContainer: RedisMessageListenerContainer,
    private val redisTemplate: StringRedisTemplate,
    private val objectMapper: ObjectMapper,
    private val verificationQueueService: VerificationQueueService,
    private val questCompletionService: QuestCompletionService,
    @Value("\${redis.events-topic:moderation:events}") private val eventsTopic: String,
    @Value("\${redis.task-ttl-seconds:86400}") private val taskTtlSeconds: Long,
) : MessageListener {

    companion object {
        private val logger = LoggerFactory.getLogger(VerificationEventListener::class.java)
        private const val PROCESSED_PREFIX = "moderation:processed"
    }

    @PostConstruct
    fun subscribe() {
        listenerContainer.addMessageListener(this, ChannelTopic(eventsTopic))
        logger.info("Subscribed to Redis channel {}", eventsTopic)
    }

    override fun onMessage(message: Message, pattern: ByteArray?) {
        val body = String(message.body)
        try {
            val event = objectMapper.readTree(body)
            val type = event.path("type").asText()
            if (type != "VERIFICATION_COMPLETED") {
                return
            }

            val taskId = event.path("taskId").asText(null) ?: return
            val status = event.path("status").asText(null)

            // Идемпотентность: обрабатываем каждый taskId ровно один раз
            val processedKey = "$PROCESSED_PREFIX:$taskId"
            val firstTime = redisTemplate.opsForValue()
                .setIfAbsent(processedKey, "1", Duration.ofSeconds(taskTtlSeconds))
            if (firstTime != true) {
                logger.debug("Task {} already processed, ignoring", taskId)
                return
            }

            if (status != "APPROVED") {
                logger.info("Task {} not approved ({}), no reward", taskId, status)
                return
            }

            handleApproved(taskId)
        } catch (ex: Exception) {
            logger.error("Failed to handle verification event: {}", body, ex)
        }
    }

    private fun handleApproved(taskId: String) {
        val resultJson = verificationQueueService.getResult(taskId)
        if (resultJson == null) {
            logger.warn("No result stored for approved task {}", taskId)
            return
        }
        val result: JsonNode = objectMapper.readTree(resultJson)

        val userId = result.path("userId").asLong(-1)
        if (userId <= 0) {
            logger.warn("Result for task {} has no valid userId", taskId)
            return
        }
        val questId = result.path("questId").let { if (it.isNull || it.isMissingNode) null else it.asLong() }
        val objectKey = result.path("objectKey").asText(null) ?: return
        val allowFeedPhotos = result.path("allowFeedPhotos").asBoolean(false)

        questCompletionService.completeVerified(
            userId = userId,
            questId = questId,
            objectKey = objectKey,
            allowFeedPhotos = allowFeedPhotos,
        )
    }
}
