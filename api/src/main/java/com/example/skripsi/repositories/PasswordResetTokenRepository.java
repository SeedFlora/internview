package com.example.skripsi.repositories;

import com.example.skripsi.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    // Invalidate any still-open reset tokens for a user before issuing a new one,
    // so only the most recent emailed link is ever valid.
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.user.userId = :userId AND t.used = false")
    void invalidateActiveTokensForUser(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :cutoff")
    void deleteExpiredBefore(@Param("cutoff") OffsetDateTime cutoff);
}
