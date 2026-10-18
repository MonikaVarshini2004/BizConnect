package com.bizconnect.dto;

import com.bizconnect.entity.enums.CategoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryWithStatsDto {
    private Long id;
    private String name;
    private String description;
    private CategoryStatus status;
    private long numberOfIdeas;
    private long numberOfVendors;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
