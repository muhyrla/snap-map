package com.snapmap.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.Instant

@Entity
@Table(name = "purchases")
class Purchase(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,

    @Column(name = "item_id", nullable = false)
    var itemId: Long = 0,

    @Column(name = "code", nullable = false)
    var code: String = "",

    @Column(name = "price_paid", nullable = false, precision = 19, scale = 2)
    var pricePaid: BigDecimal = BigDecimal.ZERO,

    @Column(name = "purchased_at", nullable = false)
    var purchasedAt: Instant = Instant.now()
)
