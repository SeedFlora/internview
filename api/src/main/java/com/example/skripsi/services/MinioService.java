package com.example.skripsi.services;

import com.example.skripsi.configs.MinioConfig;
import com.example.skripsi.exceptions.BadRequestExceptions;
import com.example.skripsi.interfaces.*;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class MinioService implements IMinioService {

    private static final SecureRandom random = new SecureRandom();

    // SECURITY: the extension is attacker-controlled and becomes part of the
    // stored object name. Whitelist to document/image types so the bucket can't
    // be seeded with e.g. .html/.svg that would render as active content.
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of("pdf", "png", "jpg", "jpeg", "webp");
    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    public MinioService(MinioClient minioClient, MinioConfig minioConfig) {
        this.minioClient = minioClient;
        this.minioConfig = minioConfig;
    }

    public String generateFileName(String extension) {
        long timestamp = Instant.now().toEpochMilli();
        long msb = (timestamp << 16) | (7L << 12) | (random.nextLong() & 0xFFF);
        long lsb = random.nextLong();
        UUID uuid = new UUID(msb, lsb);
        return uuid.toString() + "." + extension;
    }

    public Map<String, String> getPresignedUploadUrl(String extension) throws Exception {
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestExceptions("Unsupported file extension");
        }
        String fileName = generateFileName(extension.toLowerCase());

        String url = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.PUT)
                        .bucket(minioConfig.getBucketName())
                        .object(fileName)
                        .expiry(300)
                        .build()
        );

        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        result.put("fileName", fileName);
        return result;
    }

    public String getPresignedViewUrl(String fileName) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(minioConfig.getBucketName())
                        .object(fileName)
                        .expiry(600)
                        .build()
        );
    }
}
