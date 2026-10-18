package com.bizconnect.dto;

import com.bizconnect.entity.AdminAuditLog;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuditLogDto {
    private Long id;

    @NotNull
    private Long adminUserId;
    private String adminUsername;

    @NotBlank
    private String action;

    @NotBlank
    private String entityType;

    private Long entityId;
    private String description;
    private LocalDateTime timestamp;

    public static AdminAuditLogDto fromEntity(AdminAuditLog log) {
        if (log == null) return null;
        return AdminAuditLogDto.builder()
                .id(log.getId())
                .adminUserId(log.getAdmin() != null ? log.getAdmin().getId() : null)
                .adminUsername(log.getAdmin() != null ? log.getAdmin().getUsername() : null)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .description(log.getDescription())
                .timestamp(log.getTimestamp())
                .build();
    }
}
