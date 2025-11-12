package com.snapmap.service

import com.snapmap.model.Quest
import com.snapmap.repository.QuestRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.context.annotation.Import
import java.math.BigDecimal

import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource

@DataJpaTest
@Import(QuestService::class)
@ActiveProfiles("h2")
@TestPropertySource(
    properties = [
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
    ]
)
class QuestServiceTest @Autowired constructor(
    private val questService: QuestService,
    private val questRepository: QuestRepository
) {

    @Test
    fun `create returns new quest when unique`() {
        val quest = Quest(
            name = "Treasure Hunt",
            metadata = """{"difficulty":"medium"}""",
            difficulty = 2,
            reward = BigDecimal("10.00"),
            durationDays = 5
        )

        val result = questService.create(quest)

        assertTrue(result.isDuplicate.not())
        assertNotNull(result.quest.id)
        val persisted = questRepository.findById(result.quest.id!!).get()
        assertEquals("Treasure Hunt", persisted.name)
        assertEquals("""{"difficulty":"medium"}""", persisted.metadata)
        assertEquals(2, persisted.difficulty)
        assertEquals(BigDecimal("10.00"), persisted.reward)
        assertEquals(5, persisted.durationDays)
    }

    @Test
    fun `create returns existing quest on duplicate name`() {
        val existing = questRepository.save(
            Quest(
                name = "Treasure Hunt",
                metadata = """{"difficulty":"medium"}"""
            )
        )
        val attempt = Quest(
            name = "Treasure Hunt",
            metadata = """{"difficulty":"hard"}"""
        )

        val result = questService.create(attempt)

        assertTrue(result.isDuplicate)
        assertEquals(existing.id, result.quest.id)
    }

    @Test
    fun `create returns existing quest on duplicate metadata`() {
        val existing = questRepository.save(
            Quest(
                name = "Treasure Hunt",
                metadata = """{"difficulty":"medium"}"""
            )
        )
        val attempt = Quest(
            name = "Forest Escape",
            metadata = """{"difficulty":"medium"}"""
        )

        val result = questService.create(attempt)

        assertTrue(result.isDuplicate)
        assertEquals(existing.id, result.quest.id)
    }

    @Test
    fun `partial update applies changes when unique`() {
        val created = questService.create(
            Quest(
                name = "Treasure Hunt",
                metadata = """{"difficulty":"medium"}""",
                difficulty = 2
            )
        ).quest

        val updated = questService.partialUpdate(
            id = created.id!!,
            name = "Treasure Hunt Reloaded",
            metadata = """{"difficulty":"hard"}""",
            difficulty = 3,
            reward = BigDecimal("15.00"),
            durationDays = 7
        )

        assertEquals("Treasure Hunt Reloaded", updated.name)
        assertEquals("""{"difficulty":"hard"}""", updated.metadata)
        assertEquals(3, updated.difficulty)
        assertEquals(BigDecimal("15.00"), updated.reward)
        assertEquals(7, updated.durationDays)
    }

    @Test
    fun `partial update fails when name already taken`() {
        val existing = questService.create(
            Quest(
                name = "Treasure Hunt",
                metadata = """{"difficulty":"medium"}"""
            )
        ).quest
        val other = questService.create(
            Quest(
                name = "Forest Escape",
                metadata = """{"difficulty":"low"}"""
            )
        ).quest

        val exception = assertThrows<IllegalArgumentException> {
            questService.partialUpdate(
                id = other.id!!,
                name = existing.name
            )
        }

        assertTrue(exception.message!!.contains("already exists"))
    }

    @Test
    fun `delete removes quest and fails on missing id`() {
        val created = questService.create(
            Quest(
                name = "Treasure Hunt",
                metadata = """{"difficulty":"medium"}"""
            )
        ).quest

        questService.delete(created.id!!)
        assertTrue(questRepository.findById(created.id!!).isEmpty)

        val thrown = assertThrows<IllegalArgumentException> {
            questService.delete(created.id!!)
        }
        assertTrue(thrown.message!!.contains("not found"))
    }
}

