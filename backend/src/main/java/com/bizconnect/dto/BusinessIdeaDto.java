package com.bizconnect.dto;

import com.bizconnect.entity.BusinessIdea;
import com.bizconnect.entity.enums.BusinessIdeaStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessIdeaDto {
    private Long id;

    @NotBlank
    private String name;

    @NotNull
    private Long categoryId;
    private String categoryName;

    private String shortDescription;
    private String detailedDescription;
    private String investmentRange;
    private String expectedProfit;
    private String requiredSkills;
    private String riskLevel;
    private String tags;
    private BusinessIdeaStatus status;

    private Long createdByUserId;
    private String createdByUsername;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BusinessIdeaDto fromEntity(BusinessIdea idea) {
        if (idea == null) return null;
        return BusinessIdeaDto.builder()
                .id(idea.getId())
                .name(idea.getName())
                .categoryId(idea.getCategory() != null ? idea.getCategory().getId() : null)
                .categoryName(idea.getCategory() != null ? idea.getCategory().getName() : null)
                .shortDescription(idea.getShortDescription())
                .detailedDescription(idea.getDetailedDescription())
                .investmentRange(idea.getInvestmentRange())
                .expectedProfit(idea.getExpectedProfit())
                .requiredSkills(idea.getRequiredSkills())
                .riskLevel(idea.getRiskLevel())
                .tags(idea.getTags())
                .status(idea.getStatus())
                .createdByUserId(idea.getCreatedBy() != null ? idea.getCreatedBy().getId() : null)
                .createdByUsername(idea.getCreatedBy() != null ? idea.getCreatedBy().getUsername() : null)
                .createdAt(idea.getCreatedAt())
                .updatedAt(idea.getUpdatedAt())
                .build();
    }
}
