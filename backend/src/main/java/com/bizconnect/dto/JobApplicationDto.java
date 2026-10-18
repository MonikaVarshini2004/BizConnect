package com.bizconnect.dto;

import com.bizconnect.entity.JobApplication;
import com.bizconnect.entity.enums.JobApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationDto {
    private Long id;

    @NotNull
    private Long jobOpeningId;
    private String jobTitle;
    private Long vendorId;
    private String businessName;

    @NotNull
    private Long userId;
    private String username;
    private String userEmail;

    private String applicationMessage;
    private JobApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    public static JobApplicationDto fromEntity(JobApplication app) {
        if (app == null) return null;
        return JobApplicationDto.builder()
                .id(app.getId())
                .jobOpeningId(app.getJobOpening() != null ? app.getJobOpening().getId() : null)
                .jobTitle(app.getJobOpening() != null ? app.getJobOpening().getTitle() : null)
                .vendorId(app.getJobOpening() != null && app.getJobOpening().getVendor() != null ? app.getJobOpening().getVendor().getId() : null)
                .businessName(app.getJobOpening() != null && app.getJobOpening().getVendor() != null ? app.getJobOpening().getVendor().getBusinessName() : null)
                .userId(app.getUser() != null ? app.getUser().getId() : null)
                .username(app.getUser() != null ? app.getUser().getUsername() : null)
                .userEmail(app.getUser() != null ? app.getUser().getEmail() : null)
                .applicationMessage(app.getApplicationMessage())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
