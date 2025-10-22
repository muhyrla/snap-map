package com.example.snapmap.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class TelegramAuthFilter(
    private val verifier: HmacInitDataVerifier,
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader(HttpHeaders.AUTHORIZATION)
        if (authHeader == null || !authHeader.lowercase().startsWith("tma ")) {
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            response.contentType = "application/json"
            response.writer.write("{\"error\":\"Unauthorized\"}")
            return
        }

        val rawInitData = authHeader.substringAfter(' ').trim()
        try {
            val params = verifier.verify(rawInitData)
            request.setAttribute(INIT_DATA_ATTR, params)
            filterChain.doFilter(request, response)
        } catch (e: Exception) {
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            response.contentType = "application/json"
            response.writer.write("{\"error\":\"${e.message ?: "Unauthorized"}\"}")
        }
    }

    companion object {
        const val INIT_DATA_ATTR: String = "tma.initData.params"
    }
}


