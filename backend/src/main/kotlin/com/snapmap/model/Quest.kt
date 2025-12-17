package com.snapmap.model

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(
    name = "quests",
    uniqueConstraints = [
        UniqueConstraint(name = "uq_quest_name", columnNames = ["name"]),
        UniqueConstraint(name = "uq_quest_metadata", columnNames = ["metadata"])
    ]
)
class Quest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(name = "name", nullable = false)
    var name: String = "",
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    var metadata: String? = null,
    
    @Column(name = "difficulty")
    var difficulty: Int? = null,
    
    @Column(name = "reward", precision = 19, scale = 2)
    var reward: BigDecimal? = null,
    
    @Column(name = "duration_days")
    var durationDays: Int? = null
)

