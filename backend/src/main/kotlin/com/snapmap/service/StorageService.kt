package com.snapmap.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import software.amazon.awssdk.core.exception.SdkException
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.HeadObjectRequest
import software.amazon.awssdk.services.s3.model.NoSuchKeyException
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest
import java.net.URL
import java.time.Duration

@Service
class StorageService(
	private val s3Client: S3Client,
	private val s3Presigner: S3Presigner,
	@Value("\${s3.bucket}") private val bucket: String,
) {

	fun generateUploadUrl(objectKey: String, contentType: String?, expiresInSeconds: Long = 600): URL {
		val putObjectRequestBuilder = PutObjectRequest.builder()
			.bucket(bucket)
			.key(objectKey)

		val putObjectPresignRequest: PutObjectPresignRequest = PutObjectPresignRequest.builder()
			.signatureDuration(Duration.ofSeconds(expiresInSeconds))
			.putObjectRequest(putObjectRequestBuilder.build())
			.build()

		val presigned: PresignedPutObjectRequest = s3Presigner.presignPutObject(putObjectPresignRequest)
		return presigned.url()
	}

	data class ObjectStatus(
		val exists: Boolean,
		val eTag: String? = null,
		val size: Long? = null,
		val lastModifiedEpochMilli: Long? = null,
	)

	fun getObjectStatus(objectKey: String): ObjectStatus {
		val headRequest = HeadObjectRequest.builder()
			.bucket(bucket)
			.key(objectKey)
			.build()
		return try {
			val head = s3Client.headObject(headRequest)
			ObjectStatus(
				exists = true,
				eTag = head.eTag(),
				size = head.contentLength(),
				lastModifiedEpochMilli = head.lastModified()?.toEpochMilli()
			)
		} catch (e: NoSuchKeyException) {
			ObjectStatus(exists = false)
		} catch (e: SdkException) {
			ObjectStatus(exists = false)
		}
	}
}


