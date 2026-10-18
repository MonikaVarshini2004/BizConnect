package com.bizconnect.service;

import com.bizconnect.dto.BusinessIdeaDto;
import com.bizconnect.dto.CategoryDto;
import com.bizconnect.dto.ProductServiceDto;
import com.bizconnect.dto.VendorDto;
import com.bizconnect.entity.BusinessIdea;
import com.bizconnect.entity.enums.BusinessIdeaStatus;
import com.bizconnect.entity.enums.CategoryStatus;
import com.bizconnect.entity.enums.ProductServiceStatus;
import com.bizconnect.entity.enums.VendorStatus;
import com.bizconnect.entity.enums.VendorVerificationStatus;
import com.bizconnect.exception.ResourceNotFoundException;
import com.bizconnect.repository.BusinessIdeaRepository;
import com.bizconnect.repository.CategoryRepository;
import com.bizconnect.repository.ProductServiceRepository;
import com.bizconnect.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceService {

    @Autowired
    private BusinessIdeaRepository businessIdeaRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ProductServiceRepository productServiceRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<BusinessIdeaDto> getPublishedIdeas() {
        return businessIdeaRepository.findByStatus(BusinessIdeaStatus.PUBLISHED).stream()
                .map(BusinessIdeaDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusinessIdeaDto getPublishedIdeaById(Long id) {
        return businessIdeaRepository.findById(id)
                .filter(idea -> idea.getStatus() == BusinessIdeaStatus.PUBLISHED)
                .map(BusinessIdeaDto::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Published business idea not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<VendorDto> getVerifiedVendors() {
        return vendorRepository.findByVerificationStatusAndVendorStatus(
                VendorVerificationStatus.VERIFIED,
                VendorStatus.ACTIVE
        ).stream().map(VendorDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VendorDto getVerifiedVendorById(Long id) {
        return vendorRepository.findById(id)
                .filter(vendor -> vendor.getVerificationStatus() == VendorVerificationStatus.VERIFIED && vendor.getVendorStatus() == VendorStatus.ACTIVE)
                .map(VendorDto::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Verified and active vendor not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<VendorDto> getVendorsByIdea(Long ideaId) {
        BusinessIdea idea = businessIdeaRepository.findById(ideaId)
                .filter(i -> i.getStatus() == BusinessIdeaStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Published business idea not found with id: " + ideaId));

        if (idea.getCategory() == null) {
            return List.of();
        }

        return vendorRepository.findByCategoryIdAndVerificationStatusAndVendorStatus(
                idea.getCategory().getId(),
                VendorVerificationStatus.VERIFIED,
                VendorStatus.ACTIVE
        ).stream().map(VendorDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductServiceDto> getApprovedServices() {
        return productServiceRepository.findByStatus(ProductServiceStatus.APPROVED).stream()
                .map(ProductServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByStatus(CategoryStatus.ACTIVE).stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
    }
}
