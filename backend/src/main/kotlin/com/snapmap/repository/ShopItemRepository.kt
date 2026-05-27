package com.snapmap.repository

import com.snapmap.model.ShopItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ShopItemRepository : JpaRepository<ShopItem, Long> {
    fun findAllByActiveTrue(): List<ShopItem>
    fun findAllByActiveTrueAndCategory(category: String): List<ShopItem>
}
