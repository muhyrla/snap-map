package com.snapmap.config

import org.springframework.amqp.core.*
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitConfig {

    @Value("\${spring.rabbitmq.template.exchange}")
    private lateinit var exchangeName: String

    @Value("\${spring.rabbitmq.template.routing-key}")
    private lateinit var routingKey: String

    @Bean
    fun moderationQueue(): Queue {
        return Queue(routingKey, true)
    }

    @Bean
    fun moderationExchange(): DirectExchange {
        return DirectExchange(exchangeName)
    }

    @Bean
    fun moderationBinding(moderationQueue: Queue, moderationExchange: DirectExchange): Binding {
        return BindingBuilder.bind(moderationQueue).to(moderationExchange).with(routingKey)
    }
}
