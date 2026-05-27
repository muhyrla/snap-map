package com.snapmap.model

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "shop_items")
class ShopItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "title", nullable = false)
    var title: String = "",

    @Column(name = "description", columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "price", nullable = false, precision = 19, scale = 2)
    var price: BigDecimal = BigDecimal.ZERO,

    @Column(name = "discount", nullable = false)
    var discount: Int = 0,

    @Column(name = "category", nullable = false)
    var category: String = "",

    @Column(name = "image_url", columnDefinition = "TEXT")
    var imageUrl: String? = null,

    @Column(name = "emoji")
    var emoji: String? = null,

    @Column(name = "active", nullable = false)
    var active: Boolean = true
)
