package com.snapmap.controller

import com.snapmap.model.User
import com.snapmap.model.UserRole
import com.snapmap.service.UserService
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@WebMvcTest(AuthController::class)
class AuthControllerTest @Autowired constructor(
    private val mockMvc: MockMvc
) {

    @MockBean
    private lateinit var userService: UserService

    private fun sampleUser(): User =
        User(
            id = 1L,
            tgId = 123456L,
            tgUsername = "test_user",
            tgAvatar = "avatar_url",
            tgFullname = "Test User",
            city = "Moscow"
        ).apply {
            role = UserRole.USER
        }

    @Nested
    @DisplayName("GET /api/me – обработка заголовка Authorization")
    inner class GetMeTests {

        @Test
        fun `возвращает 401, если заголовок отсутствует`() {
            mockMvc.get("/api/me")
                .andExpect {
                    status { isUnauthorized() }
                    content { contentType(MediaType.APPLICATION_JSON) }
                    jsonPath("$.error") { value("Authorization header is missing") }
                }
        }

        @Test
        fun `возвращает 401, если формат заголовка неверный`() {
            mockMvc.get("/api/me") {
                header("Authorization", "Bearer something")
            }.andExpect {
                status { isUnauthorized() }
                content { contentType(MediaType.APPLICATION_JSON) }
                jsonPath("$.error") {
                    value(
                        "Invalid Authorization header format. Expected 'tma <initData>'"
                    )
                }
            }
        }

        @Test
        fun `возвращает 401, если UserService выбрасывает IllegalArgumentException`() {
            val initData = "some-invalid-init-data"
            given(userService.createOrUpdateUser(initData))
                .willThrow(IllegalArgumentException("bad init data"))

            mockMvc.get("/api/me") {
                header("Authorization", "tma $initData")
            }.andExpect {
                status { isUnauthorized() }
                content { contentType(MediaType.APPLICATION_JSON) }
                jsonPath("$.error", containsString("bad init data"))
            }
        }

        @Test
        fun `возвращает 500, если UserService выбрасывает неожиданное исключение`() {
            val initData = "some-init-data"
            given(userService.createOrUpdateUser(initData))
                .willThrow(RuntimeException("boom"))

            mockMvc.get("/api/me") {
                header("Authorization", "tma $initData")
            }.andExpect {
                status { isInternalServerError() }
                content { contentType(MediaType.APPLICATION_JSON) }
                jsonPath("$.error", containsString("Internal server error"))
            }
        }

        @Test
        fun `возвращает данные пользователя при валидном заголовке`() {
            val initData = "valid-init-data"
            val user = sampleUser()
            given(userService.createOrUpdateUser(initData)).willReturn(user)

            mockMvc.get("/api/me") {
                header("Authorization", "tma $initData")
            }.andExpect {
                status { isOk() }
                content { contentType(MediaType.APPLICATION_JSON) }
                jsonPath("$.id") { value(user.id!!.toInt()) }
                jsonPath("$.tg_id") { value(user.tgId.toInt()) }
                jsonPath("$.tg_username") { value(user.tgUsername) }
                jsonPath("$.tg_fullname") { value(user.tgFullname) }
                jsonPath("$.city") { value(user.city) }
                jsonPath("$.balance") { exists() }
            }
        }
    }
}


