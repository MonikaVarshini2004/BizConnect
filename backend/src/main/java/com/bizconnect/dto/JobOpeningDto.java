package com.bizconnect.dto;

import com.bizconnect.entity.JobOpening;
import com.bizconnect.entity.enums.JobOpeningStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOpeningDto {
    private Long id;
    private Long vendorId;
    private String businessName;

    @NotBlank(message = "Job title is required")
    private String title;

    private String description;
    private String requiredSkills;
    private String location;
    private Integer openings;
    private Long applicationsCount;
    private JobOpeningStatus status;
    private LocalDateTime createdAt;
    private LocalDate closingDate;

    public static JobOpeningDto fromEntity(JobOpening job) {
        if (job == null) return null;
        return JobOpeningDto.builder()
                .id(job.getId())
                .vendorId(job.getVendor() != null ? job.getVendor().getId() : null)
                .businessName(job.getVendor() != null ? job.getVendor().getBusinessName() : null)
                .title(job.getTitle())
                .description(job.getDescription())
                .requiredSkills(job.getRequiredSkills())
                .location(job.getLocation())
                .openings(job.getOpenings())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .closingDate(job.getClosingDate())
                .build();
    }
}
