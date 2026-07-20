package com.example.skripsi.controllers;

import com.example.skripsi.configs.*;
import com.example.skripsi.exceptions.*;
import com.example.skripsi.interfaces.*;
import com.example.skripsi.models.*;
import com.example.skripsi.models.auth.*;
import com.example.skripsi.models.constant.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final IAuthService authService;
    private final Long refreshTokenExpiration;

    public AuthController(
            IAuthService authService,
            JwtConfig jwtConfig
    ) {
        this.authService = authService;
        this.refreshTokenExpiration = jwtConfig.getJwtRefreshExpiration();
    }

    @PostMapping("/register")
    public WebResponse<?> register(@Valid @RequestBody Register register) {
        authService.register(register);

        return WebResponse.builder()
                .success(true)
                .message("Register success")
                .result("Successfully Created Account")
                .build();
    }

    @PostMapping("/login")
    public WebResponse<?> login(
            @Valid @RequestBody Login login,
            HttpServletResponse response
    ) {
        var result = authService.login(login);

        ResponseCookie cookie = ResponseCookie.from(CookieConstants.REFRESH_TOKEN_NAME, result.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path(CookieConstants.REFRESH_TOKEN_PATH)
                .sameSite(CookieConstants.SAME_SITE_POLICY)
                .maxAge((int) (refreshTokenExpiration / 1000))
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        return WebResponse.builder()
                .success(true)
                .message("Login success")
                .result(Map.of("accessToken", result.getAccessToken()))
                .build();
    }

    @PostMapping("/forgot-password")
    public WebResponse<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        // Always the same response whether or not the email exists (no account
        // enumeration).
        return WebResponse.builder()
                .success(true)
                .message("If that email is registered, a password reset link has been sent.")
                .build();
    }

    @PostMapping("/reset-password")
    public WebResponse<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return WebResponse.builder()
                .success(true)
                .message("Password has been reset. Please log in with your new password.")
                .build();
    }

    @PostMapping("/refresh")
    public WebResponse<?> refresh(HttpServletRequest request) {
        String refreshToken = extractRefreshTokenFromCookie(request);

        if (refreshToken == null) {
            throw new BadRequestExceptions("Missing refresh token");
        }

        var result = authService.refresh(refreshToken);

        return WebResponse.builder()
                .success(true)
                .message("New access token created")
                .result(Map.of("accessToken", result.getAccessToken()))
                .build();
    }

    @PostMapping("/logout")
    public WebResponse<?> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String refreshToken = extractRefreshTokenFromCookie(request);

        // Best-effort revoke: a missing/garbage cookie must never stop us from
        // clearing the browser cookie, so token errors are swallowed here.
        if (refreshToken != null) {
            try {
                authService.logout(refreshToken);
            } catch (RuntimeException ex) {
                // already-revoked / unparseable token -> nothing to revoke.
            }
        }

        // BUG FIX: the old clear used a bare Cookie with no SameSite attribute.
        // Login sets the cookie with SameSite=None, and Chrome will not overwrite/
        // delete a cross-site cookie unless the deletion carries the SAME
        // attributes -> on the prod cross-site setup the revoked cookie lingered
        // in the browser. Mirror login's ResponseCookie exactly.
        ResponseCookie clearCookie = ResponseCookie.from(CookieConstants.REFRESH_TOKEN_NAME, "")
                .httpOnly(true)
                .secure(true)
                .path(CookieConstants.REFRESH_TOKEN_PATH)
                .sameSite(CookieConstants.SAME_SITE_POLICY)
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", clearCookie.toString());

        return WebResponse.builder()
                .success(true)
                .message("Logout success")
                .build();
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) return null;

        return Arrays.stream(cookies)
                .filter(cookie -> CookieConstants.REFRESH_TOKEN_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}