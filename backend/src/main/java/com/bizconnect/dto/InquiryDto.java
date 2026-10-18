package com.bizconnect.dto;

import com.bizconnect.entity.Inquiry;
import com.bizconnect.entity.enums.InquiryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDto {
    private Long id;

    @NotNull
    private Long userId;
    private String username;

    @NotNull
    private Long vendorId;
    private String businessName;

    private Long businessIdeaId;
    private String businessIdeaName;

    @NotBlank
    private String message;
    private InquiryStatus status;
    private String vendorResponse;
    private BigDecimal quotedPrice;
    private String deliveryInformation;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;

    public static InquiryDto fromEntity(Inquiry inquiry) {
        if (inquiry == null) return null;
        return InquiryDto.builder()
                .id(inquiry.getId())
                .userId(inquiry.getUser() != null ? inquiry.getUser().getId() : null)
                .username(inquiry.getUser() != null ? inquiry.getUser().getUsername() : null)
                .vendorId(inquiry.getVendor() != null ? inquiry.getVendor().getId() : null)
                .businessName(inquiry.getVendor() != null ? inquiry.getVendor().getBusinessName() : null)
                .businessIdeaId(inquiry.getBusinessIdea() != null ? inquiry.getBusinessIdea().getId() : null)
                .businessIdeaName(inquiry.getBusinessIdea() != null ? inquiry.getBusinessIdea().getName() : null)
                .message(inquiry.getMessage())
                .status(inquiry.getStatus())
                .vendorResponse(inquiry.getVendorResponse())
                .quotedPrice(inquiry.getQuotedPrice())
                .deliveryInformation(inquiry.getDeliveryInformation())
                .createdAt(inquiry.getCreatedAt())
                .respondedAt(inquiry.getRespondedAt())
                .build();
    }
}
