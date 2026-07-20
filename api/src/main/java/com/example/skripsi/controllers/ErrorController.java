package com.example.skripsi.controllers;

import com.example.skripsi.exceptions.*;
import com.example.skripsi.models.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.concurrent.CompletionException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ErrorController {
    private static final Logger log = LoggerFactory.getLogger(ErrorController.class);

    // BUG FIX: this handler was missing its @ExceptionHandler annotation, so it
    // never registered -- unmapped routes fell through to the catch-all below
    // and returned HTTP 500 with the raw framework message. Now a proper 404.
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<WebResponse<?>> handleNotFound(NoHandlerFoundException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message("Not Found")
                        .build());
    }

    // Wrong HTTP method on an existing path -> 405 (was leaking as 500).
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<WebResponse<?>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex){
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message("Method Not Allowed")
                        .build());
    }

    // Missing required query/form parameter -> 400 (was leaking parameter names
    // and Java types as a 500).
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<WebResponse<?>> handleMissingParam(MissingServletRequestParameterException ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message("Missing required request parameter")
                        .build());
    }

    // Wrong type in a path/query variable (e.g. DELETE /company/abc where a Long
    // id is expected) -> 400 with a generic message, not a 500 stack trace.
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<WebResponse<?>> handleTypeMismatch(MethodArgumentTypeMismatchException ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message("Invalid value for parameter '" + ex.getName() + "'")
                        .build());
    }

    // Malformed / unreadable JSON body -> 400 (was a 500 from the message
    // converter).
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<WebResponse<?>> handleUnreadableBody(HttpMessageNotReadableException ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message("Malformed request body")
                        .build());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<WebResponse<?>> handleAccessDenied(AccessDeniedException ex) {
        // An unauthenticated caller hitting a protected route must get 401 (so the
        // SPA's response interceptor tries a token refresh), not 403. Only an
        // authenticated-but-under-privileged caller gets 403. Before this, every
        // @PreAuthorize denial -- including a user whose access token simply
        // expired -- returned 403, and the frontend never attempted the refresh.
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        boolean unauthenticated = auth == null
                || !auth.isAuthenticated()
                || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken;
        HttpStatus status = unauthenticated ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN;
        log.warn("Access denied ({}): {}", status.value(), ex.getMessage());
        return ResponseEntity.status(status)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(CustomAccessDeniedException.class)
    public ResponseEntity<WebResponse<?>> customHandleAccessDenied(CustomAccessDeniedException ex) {
        log.warn("Custom access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<WebResponse<String>> handleInvalidCredentials(InvalidCredentialsException ex){
        log.warn("Invalid credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(BadRequestExceptions.class)
    public ResponseEntity<WebResponse<String>> handleBadRequest(BadRequestExceptions ex){
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<WebResponse<String>> handleInvalidRefreshToken(InvalidTokenException ex) {
        log.warn("Invalid token: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<WebResponse<String>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<WebResponse<String>> handleValidationError(ValidationException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<WebResponse<?>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(WebResponse.builder()
                        .success(false)
                        .message(errorMessage)
                        .build());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<WebResponse<String>> apiException(ResponseStatusException ex){
        return ResponseEntity.status(ex.getStatusCode())
                .body(WebResponse.<String>builder()
                        .success(false)
                        .message(ex.getReason())
                        .build());
    }

    @ExceptionHandler(CompletionException.class)
    public ResponseEntity<WebResponse<?>> handleCompletionException(CompletionException ex) {
        Throwable cause = ex.getCause() != null ? ex.getCause() : ex;
        String causeMsg = cause.getMessage();
        log.error("Async operation failed", cause);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(WebResponse.builder()
                        .success(false)
                        .message("Async operation failed: " + causeMsg)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<WebResponse<?>> handleGeneralException(Exception ex){
        // SECURITY: log the real cause server-side, but never echo ex.getMessage()
        // to the client -- it leaks class names, SQL/driver detail, and internal
        // parameter names to unauthenticated callers.
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(WebResponse.builder()
                        .success(false)
                        .message("An unexpected error occurred. Please try again later.")
                        .build());
    }
}