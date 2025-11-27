package com.snapmap.controller

import com.snapmap.model.Quest
import com.snapmap.model.User
import com.snapmap.model.UserRole
import com.snapmap.service.QuestService
import com.snapmap.service.UserService
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyLong
import org.mockito.ArgumentMatchers.eq
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.post

@WebMvcTest(AdminQuestController::class)
class AdminQuestControllerTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    @MockBean
    private lateinit var questService: QuestService

    @MockBean
    private lateinit var userService: UserService

    private val adminHeader = "tma valid-admin-init-data"

    private fun adminUser(): User =
        User(
            id = 1L,
            tgId = 111L,
            tgUsername = "admin",
            tgFullname = "Admin User"
        ).apply {
            role = UserRole.ADMIN
        }

    private fun normalUser(): User =
        User(
            id = 2L,
            tgId = 222L,
            tgUsername = "user",
            tgFullname = "Normal User"
        ).apply {
            role = UserRole.USER
        }

    private fun sampleQuest(id: Long = 10L): Quest =
        Quest(
            id = id,
            name = "Quest $id",
            metadata = """{"difficulty":"medium"}"""
        )

    @Nested
    inner class GetAllQuests {

        @Test
        fun `возвращает 401 без заголовка Authorization`() {
            mockMvc.get("/api/admin/quests")
                .andExpect {
                    status { isUnauthorized() }
                }
        }

        @Test
        fun `возвращает 403, если пользователь не админ`() {
            given(userService.createOrUpdateUser("not-admin-init"))
                .willReturn(normalUser())

            mockMvc.get("/api/admin/quests") {
                header("Authorization", "tma not-admin-init")
            }.andExpect {
                status { isForbidden() }
            }
        }

        @Test
        fun `возвращает список квестов для администратора`() {
            given(userService.createOrUpdateUser("valid-admin-init-data"))
                .willReturn(adminUser())

            given(questService.findAll()).willReturn(
                listOf(sampleQuest(1L), sampleQuest(2L))
            )

            mockMvc.get("/api/admin/quests") {
                header("Authorization", adminHeader)
            }.andExpect {
                status { isOk() }
                content { contentType(MediaType.APPLICATION_JSON) }
                jsonPath("$[0].id") { value(1) }
                jsonPath("$[1].id") { value(2) }
            }
        }
    }

    @Nested
    inner class GetQuestById {

        @Test
        fun `возвращает 404, если квест не найден`() {
            given(userService.createOrUpdateUser("valid-admin-init-data"))
                .willReturn(adminUser())
            given(questService.findById(anyLong())).willReturn(null)

            mockMvc.get("/api/admin/quests/99") {
                header("Authorization", adminHeader)
            }.andExpect {
                status { isNotFound() }
                jsonPath("$.error", containsString("Quest with id 99 not found"))
            }
        }

        @Test
        fun `возвращает квест, если он существует`() {
            given(userService.createOrUpdateUser("valid-admin-init-data"))
                .willReturn(adminUser())
            given(questService.findById(10L)).willReturn(sampleQuest(10L))

            mockMvc.get("/api/admin/quests/10") {
                header("Authorization", adminHeader)
            }.andExpect {
                status { isOk() }
                jsonPath("$.id") { value(10) }
                jsonPath("$.name") { value("Quest 10") }
            }
        }
    }

    @Nested
    inner class DeleteQuest {

        @Test
        fun `возвращает 204 при успешном удалении`() {
            given(userService.createOrUpdateUser("valid-admin-init-data"))
                .willReturn(adminUser())

            mockMvc.delete("/api/admin/quests/10") {
                header("Authorization", adminHeader)
            }.andExpect {
                status { isNoContent() }
            }
        }

        @Test
        fun `возвращает 404, если сервис выкидывает IllegalArgumentException`() {
            given(userService.createOrUpdateUser("valid-admin-init-data"))
                .willReturn(adminUser())

            org.mockito.BDDMockito.willThrow(
                IllegalArgumentException("Quest not found")
            ).given(questService).delete(99L)

            mockMvc.delete("/api/admin/quests/99") {
                header("Authorization", adminHeader)
            }.andExpect {
                status { isNotFound() }
                jsonPath("$.error", containsString("Quest not found"))
            }
        }
    }
}


