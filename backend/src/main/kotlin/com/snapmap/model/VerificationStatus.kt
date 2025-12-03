package com.snapmap.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "verification_status")
data class VerificationStatus(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "task_id", nullable = false, unique = true)
    val taskId: String,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "object_key", nullable = false)
    val objectKey: String,

    @Column(name = "state", nullable = false)
    var state: String,

    @Column(name = "message")
    var message: String? = null,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
