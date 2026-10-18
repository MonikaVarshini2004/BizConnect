package com.bizconnect.dto;

import com.bizconnect.entity.Vendor;
import com.bizconnect.entity.enums.VendorStatus;
import com.bizconnect.entity.enums.VendorVerificationStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDto {
    private Long id;
    private Long userId;
    private String username;

    @NotBlank
    private String businessName;

    private String ownerName;
    private String email;
    private String phone;
    private String address;
    private String description;

    private Long categoryId;
    private String categoryName;

    private VendorVerificationStatus verificationStatus;
    private VendorStatus vendorStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime verifiedAt;
    private String rejectionReason;

    public String getCompanyName() {
        return businessName;
    }

    public static VendorDto fromEntity(Vendor vendor) {
        if (vendor == null) return null;
        return VendorDto.builder()
                .id(vendor.getId())
                .userId(vendor.getUser() != null ? vendor.getUser().getId() : null)
                .username(vendor.getUser() != null ? vendor.getUser().getUsername() : null)
                .businessName(vendor.getBusinessName())
                .ownerName(vendor.getOwnerName())
                .email(vendor.getEmail())
                .phone(vendor.getPhone())
                .address(vendor.getAddress())
                .description(vendor.getDescription())
                .categoryId(vendor.getCategory() != null ? vendor.getCategory().getId() : null)
                .categoryName(vendor.getCategory() != null ? vendor.getCategory().getName() : null)
                .verificationStatus(vendor.getVerificationStatus())
                .vendorStatus(vendor.getVendorStatus())
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .verifiedAt(vendor.getVerifiedAt())
                .rejectionReason(vendor.getRejectionReason())
                .build();
    }
}
