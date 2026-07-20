package com.example.skripsi.services;

import com.example.skripsi.entities.*;
import com.example.skripsi.exceptions.*;
import com.example.skripsi.interfaces.*;
import com.example.skripsi.models.auth.*;
import com.example.skripsi.models.constant.*;
import com.example.skripsi.repositories.*;
import com.example.skripsi.securities.*;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@Transactional
public class AuthService implements IAuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserTokenRepository userTokenRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final IRegionService regionService;
    private final IMajorService majorService;
    private final JwtUtils jwtUtils;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.reset-token.expiration-minutes}")
    private int resetTokenExpirationMinutes;

    public AuthService(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            UserTokenRepository userTokenRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService,
            IRegionService regionService,
            IMajorService majorService,
            JwtUtils jwtUtils
    ) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userTokenRepository = userTokenRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.regionService = regionService;
        this.majorService = majorService;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void register(Register register) {
        String email = register.getEmail().toLowerCase();
        log.info("[register] attempt email={}", email);

        if (userRepository.findByEmail(email).isPresent()) {
            log.warn("[register] email already in use email={}", email);
            throw new BadRequestExceptions(MessageConstants.Auth.EMAIL_ALREADY_USED);
        }

        Region region = regionService.findRegionById(Long.valueOf(register.getRegionId()));

        Major major = majorService.findMajorById(Long.valueOf(register.getMajorId()));

        if (!major.getRegion().getRegionId().equals(region.getRegionId())) {
            log.warn("[register] major regionId={} does not match regionId={}", major.getRegion().getRegionId(), region.getRegionId());
            throw new BadRequestExceptions(MessageConstants.Validation.MAJOR_DOES_NOT_BELONG_TO_REGION);
        }

        String encodedPassword = BCrypt.hashpw(
                register.getPassword(),
                BCrypt.gensalt()
        );

        User user = User.builder()
                .firstName(register.getFirstName())
                .lastName(register.getLastName())
                .email(email)
                .password(encodedPassword)
                .createdAt(OffsetDateTime.now())
                .build();

        userRepository.save(user);

        String registerId = register.getRegisterId();
        String studentId = null;
        String lectureId = null;

        if (registerId.length() == 10) {
            studentId = registerId;
        } else if (registerId.length() == 5 && registerId.startsWith("D")) {
            lectureId = registerId;
        } else {
            log.warn("[register] invalid registerId format registerId={}", registerId);
            throw new BadRequestExceptions(MessageConstants.Auth.INVALID_STUDENT_ID_OR_LECTURE_ID);
        }

        UserProfile profile = UserProfile.builder()
                .user(user)
                .phoneNumber(register.getPhoneNumber())
                .region(region)
                .major(major)
                .studentId(studentId)
                .lectureId(lectureId)
                .createdAt(OffsetDateTime.now())
                .build();

        userProfileRepository.save(profile);

        // BUG FIX: registration previously created the account with NO row in
        // user_roles, so every self-registered user carried an empty "roles"
        // claim in their JWT. Nothing role-gated with hasRole('USER') exists
        // yet, so it was silent -- but the role model was half-wired and any
        // future USER-gated feature would deny every legitimate user. Assign
        // the default USER role atomically with the account (class-level
        // @Transactional keeps user/profile/role all-or-nothing).
        Role userRole = roleRepository.findByRoleNameIgnoreCase("USER")
                .orElseThrow(() -> new ResourceNotFoundException("Role USER not found"));
        userRoleRepository.save(UserRole.builder()
                .userId(user.getUserId())
                .roleId(userRole.getRoleId())
                .build());

        log.info("[register] success userId={} email={}", user.getUserId(), email);
    }

    @Override
    public AuthResponse login(Login login) {
        String email = login.getEmail().toLowerCase();
        log.info("[login] attempt email={}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("[login] user not found email={}", email);
                    return new InvalidCredentialsException(MessageConstants.Auth.INVALID_EMAIL_OR_PASSWORD);
                });

        if (!BCrypt.checkpw(login.getPassword(), user.getPassword())) {
            log.warn("[login] invalid password userId={}", user.getUserId());
            throw new InvalidCredentialsException(MessageConstants.Auth.INVALID_EMAIL_OR_PASSWORD);
        }

        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getRoleName)
                .toList();

        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), roles);
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());
        String jti = jwtUtils.getJti(refreshToken);

        OffsetDateTime expiresAt = OffsetDateTime.now()
                .plusSeconds(jwtUtils.getRefreshTokenExpirationSeconds());

        UserToken token = UserToken.builder()
                .user(user)
                .jti(jti)
                .createdAt(OffsetDateTime.now())
                .expiresAt(expiresAt)
                .revoked(false)
                .build();

        userTokenRepository.save(token);
        log.info("[login] success userId={} email={}", user.getUserId(), email);

        return toAuthResponse(accessToken, refreshToken);
    }

    // Parses the refresh token's jti, converting any JWT parse failure into a
    // 401-mapped InvalidTokenException instead of letting it become a 500.
    private String extractJtiOrReject(String refreshToken) {
        try {
            return jwtUtils.getJti(refreshToken);
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException ex) {
            log.warn("[auth] unparseable refresh token: {}", ex.getMessage());
            throw new InvalidTokenException("Invalid or expired refresh token");
        }
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        // BUG FIX: a malformed/garbage refresh cookie made jwtUtils.getJti throw a
        // raw JwtException that fell through to the catch-all handler as HTTP 500
        // (remotely triggerable, with a stack trace logged). Treat any unparseable
        // token as an invalid credential -> 401.
        String jti = extractJtiOrReject(refreshToken);
        log.info("[refresh] attempt jti={}", jti);

        UserToken tokenRecord = userTokenRepository
                .findValidRefreshToken(jti, OffsetDateTime.now())
                .orElseThrow(() -> {
                    log.warn("[refresh] token not found or expired jti={}", jti);
                    return new InvalidTokenException("Invalid or expired refresh token");
                });

        User user = tokenRecord.getUser();

        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getRoleName)
                .toList();

        String newAccessToken = jwtUtils.generateAccessToken(user.getEmail(), roles);
        log.info("[refresh] success userId={}", user.getUserId());

        return toAuthResponse(newAccessToken, null);
    }

    @Override
    public void logout(String refreshToken) {
        String jti = extractJtiOrReject(refreshToken);
        log.info("[logout] attempt jti={}", jti);

        UserToken tokenRecord = userTokenRepository
                .findValidRefreshToken(jti, OffsetDateTime.now())
                .orElseThrow(() -> {
                    log.warn("[logout] token not found or expired jti={}", jti);
                    return new InvalidTokenException("Invalid or expired refresh token");
                });

        tokenRecord.setRevoked(true);
        userTokenRepository.save(tokenRecord);
        log.info("[logout] success userId={}", tokenRecord.getUser().getUserId());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase();
        log.info("[forgotPassword] request email={}", email);

        // Enumeration protection: the controller always returns the same generic
        // message. If the email is not registered we simply do nothing here.
        userRepository.findByEmail(email).ifPresent(user -> {
            // Only the most recent link should ever be valid.
            passwordResetTokenRepository.invalidateActiveTokensForUser(user.getUserId());

            String rawToken = generateRawToken();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(sha256Hex(rawToken))
                    .expiresAt(OffsetDateTime.now().plusMinutes(resetTokenExpirationMinutes))
                    .used(false)
                    .createdAt(OffsetDateTime.now())
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
            try {
                emailService.sendPasswordResetEmail(email, resetLink, resetTokenExpirationMinutes);
            } catch (MailException ex) {
                // Do not leak SMTP failures to the caller (enumeration + UX), but
                // surface them in the logs so a misconfigured mailer is diagnosable.
                log.error("[forgotPassword] failed to send reset email to {}: {}", email, ex.getMessage());
            }
        });
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = sha256Hex(request.getToken());

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> {
                    log.warn("[resetPassword] token not found");
                    return new BadRequestExceptions("Invalid or expired reset link");
                });

        if (Boolean.TRUE.equals(resetToken.getUsed())
                || resetToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            log.warn("[resetPassword] token used or expired resetTokenId={}", resetToken.getResetTokenId());
            throw new BadRequestExceptions("Invalid or expired reset link");
        }

        User user = resetToken.getUser();
        user.setPassword(BCrypt.hashpw(request.getNewPassword(), BCrypt.gensalt()));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // A password reset invalidates existing sessions everywhere.
        userTokenRepository.revokeAllForUser(user.getUserId());

        log.info("[resetPassword] success userId={}", user.getUserId());
    }

    // 32 bytes of CSPRNG entropy, URL-safe base64 without padding.
    private String generateRawToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (java.security.NoSuchAlgorithmException ex) {
            // SHA-256 is guaranteed present on every JVM.
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    private AuthResponse toAuthResponse(String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
