package com.snapmap.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.connection.RedisStandaloneConfiguration
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory
import org.springframework.data.redis.core.StringRedisTemplate

@Configuration
class RedisConfig(
	@Value("\${redis.host:127.0.0.1}") private val host: String,
	@Value("\${redis.port:6379}") private val port: Int,
	@Value("\${redis.password:}") private val redisPassword: String,
	@Value("\${redis.database:0}") private val database: Int,
) {

	@Bean
	fun redisConnectionFactory(): RedisConnectionFactory {
		val configuration = RedisStandaloneConfiguration(host, port).apply {
			if (redisPassword.isNotEmpty()) {
				setPassword(redisPassword)
			}
			this.database = database
		}
		return LettuceConnectionFactory(configuration)
	}

	@Bean
	fun stringRedisTemplate(connectionFactory: RedisConnectionFactory): StringRedisTemplate =
		StringRedisTemplate(connectionFactory)
}


