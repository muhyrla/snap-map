package com.snapmap.security

import com.snapmap.model.User
import com.snapmap.model.UserRole
import com.snapmap.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

object AdminSecurityHelper {
    fun checkAdminAccess(
        authorizationHeader: String?,
        userService: UserService
    ): User {
        if (authorizationHeader.isNullOrBlank()) {
            throw ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authorization header is missing"
            )
        }

        val parts = authorizationHeader.split(" ", limit = 2)
        if (parts.size != 2 || !parts[0].equals("tma", ignoreCase = true)) {
            throw ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid Authorization header format. Expected 'tma <initData>'"
            )
        }

        val initData = parts[1]
        
        return try {
            val user = userService.createOrUpdateUser(initData)
            
            if (user.role != UserRole.ADMIN) {
                throw ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied. Admin role required."
                )
            }
            
            user
        } catch (e: IllegalArgumentException) {
            throw ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid initData: ${e.message}"
            )
        } catch (e: ResponseStatusException) {
            throw e
        } catch (e: Exception) {
            throw ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error: ${e.message}"
            )
        }
    }
}

