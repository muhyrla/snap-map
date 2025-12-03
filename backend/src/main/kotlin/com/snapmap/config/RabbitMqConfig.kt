package com.snapmap.config

import org.springframework.amqp.rabbit.connection.ConnectionFactory
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfig(
    private val connectionFactory: ConnectionFactory
) {

    @Bean
    fun rabbitTemplate(): RabbitTemplate = RabbitTemplate(connectionFactory)
}
