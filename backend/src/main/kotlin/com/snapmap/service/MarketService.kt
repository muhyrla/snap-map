package com.snapmap.service

import com.snapmap.model.Purchase
import com.snapmap.model.ShopItem
import com.snapmap.repository.PurchaseRepository
import com.snapmap.repository.ShopItemRepository
import com.snapmap.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.Instant

@Service
class MarketService(
    private val shopItemRepository: ShopItemRepository,
    private val purchaseRepository: PurchaseRepository,
    private val userRepository: UserRepository,
    private val userService: UserService
) {
    data class ShopItemDto(
        val id: Long,
        val title: String,
        val description: String?,
        val price: Int,
        val discount: Int,
        val category: String,
        val imageUrl: String?,
        val emoji: String?
    )

    data class PurchaseDto(
        val id: Long,
        val item: ShopItemDto,
        val code: String,
        val pricePaid: Int,
        val purchasedAt: Instant
    )

    fun getItems(initData: String, category: String?): List<ShopItemDto> {
        userService.createOrUpdateUser(initData)
        val items = if (category.isNullOrBlank()) {
            shopItemRepository.findAllByActiveTrue()
        } else {
            shopItemRepository.findAllByActiveTrueAndCategory(category)
        }
        return items.map { it.toDto() }
    }

    @Transactional
    fun purchase(initData: String, itemId: Long): PurchaseDto {
        val user = userService.createOrUpdateUser(initData)
        val item = shopItemRepository.findById(itemId)
            .orElseThrow { IllegalArgumentException("Item $itemId not found") }

        if (user.balance < item.price) {
            throw IllegalStateException("Insufficient balance")
        }

        user.balance = user.balance.subtract(item.price)
        userRepository.save(user)

        val code = generateCode()
        val purchase = purchaseRepository.save(
            Purchase(
                userId    = user.id!!,
                itemId    = item.id!!,
                code      = code,
                pricePaid = item.price,
            )
        )

        return PurchaseDto(
            id          = purchase.id!!,
            item        = item.toDto(),
            code        = code,
            pricePaid   = item.price.toInt(),
            purchasedAt = purchase.purchasedAt
        )
    }

    fun getPurchases(initData: String): List<PurchaseDto> {
        val user = userService.createOrUpdateUser(initData)
        val purchases = purchaseRepository.findAllByUserIdOrderByPurchasedAtDesc(user.id!!)
        val itemIds = purchases.map { it.itemId }.toSet()
        val itemMap = shopItemRepository.findAllById(itemIds).associateBy { it.id!! }

        return purchases.mapNotNull { p ->
            val item = itemMap[p.itemId] ?: return@mapNotNull null
            PurchaseDto(
                id          = p.id!!,
                item        = item.toDto(),
                code        = p.code,
                pricePaid   = p.pricePaid.toInt(),
                purchasedAt = p.purchasedAt
            )
        }
    }

    // ─── Админские операции над товарами ────────────────────────────────

    /** Полный админский DTO товара (в т.ч. active, для управления). */
    data class AdminShopItemDto(
        val id: Long,
        val title: String,
        val description: String?,
        val price: Int,
        val discount: Int,
        val category: String,
        val imageUrl: String?,
        val emoji: String?,
        val active: Boolean
    )

    data class ShopItemInput(
        val title: String = "",
        val description: String? = null,
        val price: Int? = null,
        val discount: Int? = null,
        val category: String? = null,
        val imageUrl: String? = null,
        val emoji: String? = null,
        val active: Boolean? = null
    )

    fun adminFindAll(): List<AdminShopItemDto> =
        shopItemRepository.findAll().map { it.toAdminDto() }

    @Transactional
    fun adminCreate(input: ShopItemInput): AdminShopItemDto {
        val item = ShopItem(
            title       = input.title,
            description = input.description,
            price       = BigDecimal.valueOf((input.price ?: 0).toLong()),
            discount    = input.discount ?: 0,
            category    = input.category ?: "",
            imageUrl    = input.imageUrl,
            emoji       = input.emoji,
            active      = input.active ?: true
        )
        return shopItemRepository.save(item).toAdminDto()
    }

    @Transactional
    fun adminUpdate(id: Long, input: ShopItemInput): AdminShopItemDto {
        val item = shopItemRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Item $id not found") }

        input.title.let { if (it.isNotBlank()) item.title = it }
        input.description?.let { item.description = it }
        input.price?.let { item.price = BigDecimal.valueOf(it.toLong()) }
        input.discount?.let { item.discount = it }
        input.category?.let { item.category = it }
        input.imageUrl?.let { item.imageUrl = it }
        input.emoji?.let { item.emoji = it }
        input.active?.let { item.active = it }

        return shopItemRepository.save(item).toAdminDto()
    }

    @Transactional
    fun adminDelete(id: Long) {
        if (!shopItemRepository.existsById(id)) {
            throw IllegalArgumentException("Item $id not found")
        }
        shopItemRepository.deleteById(id)
    }

    private fun ShopItem.toAdminDto() = AdminShopItemDto(
        id          = id!!,
        title       = title,
        description = description,
        price       = price.toInt(),
        discount    = discount,
        category    = category,
        imageUrl    = imageUrl,
        emoji       = emoji,
        active      = active
    )

    private fun ShopItem.toDto() = ShopItemDto(
        id          = id!!,
        title       = title,
        description = description,
        price       = price.toInt(),
        discount    = discount,
        category    = category,
        imageUrl    = imageUrl,
        emoji       = emoji
    )

    private fun generateCode(): String {
        val chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return "SNAP-" + (1..5).map { chars.random() }.joinToString("")
    }
}
