package com.bizconnect.repository;

import com.bizconnect.entity.AdminAuditLog;
import com.bizconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {

    List<AdminAuditLog> findByAdminOrderByTimestampDesc(User admin);

    List<AdminAuditLog> findByAdminIdOrderByTimestampDesc(Long adminId);

    List<AdminAuditLog> findByEntityTypeOrderByTimestampDesc(String entityType);

    List<AdminAuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
}
