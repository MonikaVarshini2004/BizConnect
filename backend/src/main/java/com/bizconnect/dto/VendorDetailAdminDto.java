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
public class VendorDetailAdminDto {
    private VendorDto vendor;
    private List<ProductServiceDto> productsAndServices;
    private InquiriesSummary inquiriesSummary;
    private List<JobOpeningDto> jobOpenings;
    private ApplicationsSummary applicationsSummary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InquiriesSummary {
        private long total;
        private long pending;
        private long responded;
        private long closed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApplicationsSummary {
        private long total;
        private long pending;
        private long accepted;
        private long rejected;
    }
}
