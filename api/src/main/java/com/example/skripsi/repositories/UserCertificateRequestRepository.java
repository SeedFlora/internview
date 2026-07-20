package com.example.skripsi.repositories;

import com.example.skripsi.entities.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface UserCertificateRequestRepository extends JpaRepository<UserCertificateRequest, Long> {
    List<UserCertificateRequest> findByNotification_NotificationId(Long notificationId);

    long countByStatus(String status);

    @Query("SELECT r FROM UserCertificateRequest r WHERE (:cursor IS NULL OR r.documentId > :cursor) ORDER BY r.documentId ASC")
    List<UserCertificateRequest> findPageFromCursor(@Param("cursor") Long cursor, Pageable pageable);

    @Query("SELECT r FROM UserCertificateRequest r WHERE r.status = :status AND (:cursor IS NULL OR r.documentId > :cursor) ORDER BY r.documentId ASC")
    List<UserCertificateRequest> findPageByStatusFromCursor(@Param("status") String status, @Param("cursor") Long cursor, Pageable pageable);

    @Query("SELECT r FROM UserCertificateRequest r WHERE (:cursor IS NULL OR r.documentId > :cursor) AND LOWER(r.documentName) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY r.documentId ASC")
    List<UserCertificateRequest> findPageBySearchFromCursor(@Param("search") String search, @Param("cursor") Long cursor, Pageable pageable);

    @Query("SELECT r FROM UserCertificateRequest r WHERE r.status = :status AND (:cursor IS NULL OR r.documentId > :cursor) AND LOWER(r.documentName) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY r.documentId ASC")
    List<UserCertificateRequest> findPageByStatusAndSearchFromCursor(@Param("status") String status, @Param("search") String search, @Param("cursor") Long cursor, Pageable pageable);
}