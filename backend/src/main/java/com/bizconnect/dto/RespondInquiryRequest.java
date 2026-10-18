package com.bizconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespondInquiryRequest {

    @NotNull(message = "Inquiry ID is required")
    private Long inquiryId;

    @NotBlank(message = "Vendor response is required")
    private String vendorResponse;

    private BigDecimal quotedPrice;

    private String deliveryInformation;
}
