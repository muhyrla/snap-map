package com.snapmap.model

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "users")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(name = "tg_id", nullable = false, unique = true)
    var tgId: Long = 0,
    
    @Column(name = "tg_username")
    var tgUsername: String? = null,
    
    @Column(name = "tg_avatar", columnDefinition = "TEXT")
    var tgAvatar: String? = null,
    
    @Column(name = "tg_fullname")
    var tgFullname: String? = null,
    
    @Column(name = "city")
    var city: String? = null,
    
    @Column(name = "balance", nullable = false)
    var balance: BigDecimal = BigDecimal.ZERO,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    var role: UserRole = UserRole.USER
)

