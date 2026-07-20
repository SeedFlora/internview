package com.example.skripsi.repositories;

import com.example.skripsi.entities.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface UserTokenRepository extends JpaRepository<UserToken,Long> {
    @Query("SELECT t FROM UserToken t WHERE t.jti = :token AND t.revoked = false AND t.expiresAt > :now")
    Optional<UserToken> findValidRefreshToken(@Param("token") String token, @Param("now") OffsetDateTime now);

    // Revoke every active refresh token for a user -- used on password reset so a
    // reset also logs the account out everywhere.
    @Modifying
    @Query("UPDATE UserToken t SET t.revoked = true WHERE t.user.userId = :userId AND t.revoked = false")
    void revokeAllForUser(@Param("userId") Long userId);
}
