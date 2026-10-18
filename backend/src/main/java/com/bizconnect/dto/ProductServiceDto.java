package com.bizconnect.dto;

import com.bizconnect.entity.ProductService;
import com.bizconnect.entity.enums.ProductServiceStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductServiceDto {
    private Long id;
    private Long vendorId;
    private String businessName;

    @NotBlank(message = "Service / Product name is required")
    private String name;

    private Long categoryId;
    private String categoryName;

    private String description;
    private BigDecimal price;
    private String priceRange;
    private String availability;
    private ProductServiceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductServiceDto fromEntity(ProductService item) {
        if (item == null) return null;
        return ProductServiceDto.builder()
                .id(item.getId())
                .vendorId(item.getVendor() != null ? item.getVendor().getId() : null)
                .businessName(item.getVendor() != null ? item.getVendor().getBusinessName() : null)
                .name(item.getName())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .description(item.getDescription())
                .price(item.getPrice())
                .priceRange(item.getPriceRange())
                .availability(item.getAvailability())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
