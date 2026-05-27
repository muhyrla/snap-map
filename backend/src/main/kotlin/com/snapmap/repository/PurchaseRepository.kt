package com.snapmap.repository

import com.snapmap.model.Purchase
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PurchaseRepository : JpaRepository<Purchase, Long> {
    fun findAllByUserIdOrderByPurchasedAtDesc(userId: Long): List<Purchase>
}
