package com.example.skripsi.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * A single-use password-reset token. Only the SHA-256 HASH of the token is
 * stored -- the raw token lives only in the emailed link -- so a database leak
 * cannot be used to reset accounts. Requires the password_reset_tokens table
 * (see prod-migration.sql); the app runs ddl-auto=validate and will not create
 * it automatically.
 */
@Entity
@Table(name = "password_reset_tokens")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reset_token_id")
    private Long resetTokenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "used", nullable = false)
    private Boolean used;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
