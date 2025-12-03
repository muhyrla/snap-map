package com.snapmap.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.snapmap.model.User
import com.snapmap.model.VerificationStatus
import com.snapmap.repository.VerificationStatusRepository
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class VerificationQueueService(
    private val rabbitTemplate: RabbitTemplate,
    private val verificationStatusRepository: VerificationStatusRepository,
    @Value("\${spring.rabbitmq.queue}") private val queueName: String
) {

    data class EnqueueResult(
        val taskId: String,
        val status: VerificationStatus
    )

    fun enqueueVerification(
        user: User,
        objectKey: String,
        expectedLabel: String,
        questId: Long?,
        allowFeedPhotos: Boolean
    ): EnqueueResult {
        val taskId = UUID.randomUUID().toString()
        val userId = user.id ?: throw IllegalArgumentException("User must be persisted")

        val status = VerificationStatus(
            taskId = taskId,
            userId = userId,
            objectKey = objectKey,
            state = "PENDING",
            message = "Awaiting processing"
        )
        verificationStatusRepository.save(status)

        val task = mapOf(
            "taskId" to taskId,
            "userId" to userId,
            "userTgId" to user.tgId,
            "objectKey" to objectKey,
            "expectedLabel" to expectedLabel,
            "questId" to questId,
            "allowFeedPhotos" to allowFeedPhotos,
            "bucket" to "snapmap" // Assuming bucket is hardcoded for now
        )

        rabbitTemplate.convertAndSend(queueName, jacksonObjectMapper().writeValueAsString(task))
        return EnqueueResult(taskId, status)
    }

    fun getStatusForUser(taskId: String, userId: Long): VerificationStatus? {
        return verificationStatusRepository.findByTaskIdAndUserId(taskId, userId)
    }
}
