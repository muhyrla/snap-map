package com.snapmap.model

import jakarta.persistence.*

@Entity
@Table(name = "user_quests")
class UserQuest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,
    
    @Column(name = "quest_id", nullable = false)
    var questId: Long = 0,
    
    @Column(name = "is_complete", nullable = false)
    var isComplete: Boolean = false
)

