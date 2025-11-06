package com.snapmap.model

import jakarta.persistence.*

@Entity
@Table(name = "completed_quests")
class CompletedQuest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,
    
    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,
    
    @Column(name = "quest_id", nullable = false)
    var questId: Long = 0,
    
    @Column(name = "photo", columnDefinition = "TEXT")
    var photo: String? = null,
    
    @Column(name = "description", columnDefinition = "TEXT")
    var description: String? = null,
    
    @Column(name = "allow_feed_photos", nullable = false)
    var allowFeedPhotos: Boolean = false
)

