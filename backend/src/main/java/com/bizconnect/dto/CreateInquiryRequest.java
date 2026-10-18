package com.bizconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInquiryRequest {

    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    private Long businessIdeaId;

    @NotBlank(message = "Inquiry message is required")
    private String message;
}
