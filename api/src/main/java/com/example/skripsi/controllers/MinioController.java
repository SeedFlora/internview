package com.example.skripsi.controllers;

import com.example.skripsi.models.*;
import com.example.skripsi.services.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/minio")
public class MinioController {

    private final MinioService minioService;

    public MinioController(MinioService minioService) {
        this.minioService = minioService;
    }

    // SECURITY: minting a presigned upload URL is a privileged action -- without
    // this an anonymous user can write arbitrary objects into the bucket. The
    // global permitAll(GET) rule in SecurityConfig does NOT bypass method
    // security, so @PreAuthorize is enforced regardless.
    @GetMapping("/upload-url")
    @PreAuthorize("isAuthenticated()")
    public WebResponse<?> getUploadUrl(@RequestParam("extension") String extension) throws Exception {
        var result = minioService.getPresignedUploadUrl(extension);
        return WebResponse.builder()
                .success(true)
                .message("Successfully generated upload URL")
                .result(result)
                .build();
    }
}
