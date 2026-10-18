package com.bizconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailAdminDto {
    private UserResponseDto user;
    private VendorDto vendorProfile; // null if not vendor
    private List<InquiryDto> inquiries;
    private List<JobApplicationDto> applications;
}
