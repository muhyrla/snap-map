package com.snapmap.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.S3Configuration.Builder
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import java.net.URI

@Configuration
class S3Config(
	@Value("\${s3.endpoint}") private val endpoint: String,
	@Value("\${s3.region}") private val region: String,
	@Value("\${s3.accessKey}") private val accessKey: String,
	@Value("\${s3.secretKey}") private val secretKey: String,
) {

	private fun credentialsProvider() =
		StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))

	private fun s3CommonConfig(): S3Configuration =
		S3Configuration.builder()
			.pathStyleAccessEnabled(true)
			.build()

	@Bean
	fun s3Client(): S3Client =
		S3Client.builder()
			.endpointOverride(URI.create(endpoint))
			.region(Region.of(region))
			.credentialsProvider(credentialsProvider())
			.serviceConfiguration(s3CommonConfig())
			.build()

	@Bean
	fun s3Presigner(): S3Presigner =
		S3Presigner.builder()
			.endpointOverride(URI.create(endpoint))
			.region(Region.of(region))
			.credentialsProvider(credentialsProvider())
			.build()
}


