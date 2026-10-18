package com.bizconnect.service;

import com.bizconnect.dto.*;
import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.*;
import com.bizconnect.exception.BadRequestException;
import com.bizconnect.exception.ResourceNotFoundException;
import com.bizconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private BusinessIdeaRepository businessIdeaRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductServiceRepository productServiceRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private JobOpeningRepository jobOpeningRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private AdminAuditLogRepository adminAuditLogRepository;

    // ==========================================
    // 1. SUMMARY
    // ==========================================
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalIdeas", businessIdeaRepository.count());
        stats.put("businessIdeas", businessIdeaRepository.count());
        stats.put("publishedIdeas", businessIdeaRepository.findByStatus(BusinessIdeaStatus.PUBLISHED).size());
        stats.put("totalVendors", vendorRepository.count());
        stats.put("verifiedVendors", vendorRepository.findByVerificationStatus(VendorVerificationStatus.VERIFIED).size());
        stats.put("pendingVendors", vendorRepository.findByVerificationStatus(VendorVerificationStatus.PENDING).size());
        stats.put("pendingVerifications", vendorRepository.findByVerificationStatus(VendorVerificationStatus.PENDING).size());
        stats.put("pendingVerification", vendorRepository.findByVerificationStatus(VendorVerificationStatus.PENDING).size());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalInquiries", inquiryRepository.count());
        stats.put("totalAuditLogs", adminAuditLogRepository.count());
        return stats;
    }

    // ==========================================
    // 2. USERS
    // ==========================================
    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDetailAdminDto getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Vendor vendor = vendorRepository.findByUserId(userId).orElse(null);
        List<InquiryDto> inquiries = inquiryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(InquiryDto::fromEntity)
                .collect(Collectors.toList());
        List<JobApplicationDto> applications = jobApplicationRepository.findByUserId(userId).stream()
                .map(JobApplicationDto::fromEntity)
                .collect(Collectors.toList());

        return UserDetailAdminDto.builder()
                .user(UserResponseDto.fromEntity(user))
                .vendorProfile(vendor != null ? VendorDto.fromEntity(vendor) : null)
                .inquiries(inquiries)
                .applications(applications)
                .build();
    }

    @Transactional
    public UserResponseDto blockUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setAccountStatus(AccountStatus.BLOCKED);
        User updated = userRepository.save(user);

        logAction(adminId, "BLOCK_USER", "User", userId, "Admin blocked user @" + user.getUsername());
        return UserResponseDto.fromEntity(updated);
    }

    @Transactional
    public UserResponseDto unblockUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setAccountStatus(AccountStatus.ACTIVE);
        User updated = userRepository.save(user);

        logAction(adminId, "UNBLOCK_USER", "User", userId, "Admin unblocked user @" + user.getUsername());
        return UserResponseDto.fromEntity(updated);
    }

    // ==========================================
    // 3. BUSINESS IDEAS
    // ==========================================
    @Transactional(readOnly = true)
    public List<BusinessIdeaDto> getAllIdeas() {
        return businessIdeaRepository.findAll().stream()
                .map(BusinessIdeaDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusinessIdeaDto getIdeaById(Long id) {
        BusinessIdea idea = businessIdeaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business idea not found with id: " + id));
        return BusinessIdeaDto.fromEntity(idea);
    }

    @Transactional
    public BusinessIdeaDto createIdea(BusinessIdeaDto dto, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + adminId));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        BusinessIdea idea = BusinessIdea.builder()
                .name(dto.getName())
                .category(category)
                .shortDescription(dto.getShortDescription())
                .detailedDescription(dto.getDetailedDescription())
                .investmentRange(dto.getInvestmentRange())
                .expectedProfit(dto.getExpectedProfit())
                .requiredSkills(dto.getRequiredSkills())
                .riskLevel(dto.getRiskLevel() != null ? dto.getRiskLevel() : "MEDIUM")
                .tags(dto.getTags())
                .status(dto.getStatus() != null ? dto.getStatus() : BusinessIdeaStatus.DRAFT)
                .createdBy(admin)
                .build();

        BusinessIdea saved = businessIdeaRepository.save(idea);
        logAction(adminId, "CREATE_IDEA", "BusinessIdea", saved.getId(), "Created business idea: " + saved.getName());
        return BusinessIdeaDto.fromEntity(saved);
    }

    @Transactional
    public BusinessIdeaDto updateIdea(Long id, BusinessIdeaDto dto, Long adminId) {
        BusinessIdea idea = businessIdeaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business idea not found with id: " + id));

        if (dto.getName() != null) idea.setName(dto.getName());
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));
            idea.setCategory(category);
        }
        if (dto.getShortDescription() != null) idea.setShortDescription(dto.getShortDescription());
        if (dto.getDetailedDescription() != null) idea.setDetailedDescription(dto.getDetailedDescription());
        if (dto.getInvestmentRange() != null) idea.setInvestmentRange(dto.getInvestmentRange());
        if (dto.getExpectedProfit() != null) idea.setExpectedProfit(dto.getExpectedProfit());
        if (dto.getRequiredSkills() != null) idea.setRequiredSkills(dto.getRequiredSkills());
        if (dto.getRiskLevel() != null) idea.setRiskLevel(dto.getRiskLevel());
        if (dto.getTags() != null) idea.setTags(dto.getTags());
        if (dto.getStatus() != null) idea.setStatus(dto.getStatus());

        BusinessIdea updated = businessIdeaRepository.save(idea);
        logAction(adminId, "UPDATE_IDEA", "BusinessIdea", id, "Updated business idea: " + updated.getName());
        return BusinessIdeaDto.fromEntity(updated);
    }

    @Transactional
    public BusinessIdeaDto publishIdea(Long id, Long adminId) {
        BusinessIdea idea = businessIdeaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business idea not found with id: " + id));

        idea.setStatus(BusinessIdeaStatus.PUBLISHED);
        BusinessIdea updated = businessIdeaRepository.save(idea);

        logAction(adminId, "PUBLISH_IDEA", "BusinessIdea", id, "Published business idea: " + updated.getName());
        return BusinessIdeaDto.fromEntity(updated);
    }

    @Transactional
    public BusinessIdeaDto archiveIdea(Long id, Long adminId) {
        BusinessIdea idea = businessIdeaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business idea not found with id: " + id));

        idea.setStatus(BusinessIdeaStatus.ARCHIVED);
        BusinessIdea updated = businessIdeaRepository.save(idea);

        logAction(adminId, "ARCHIVE_IDEA", "BusinessIdea", id, "Archived business idea: " + updated.getName());
        return BusinessIdeaDto.fromEntity(updated);
    }

    // ==========================================
    // 4. VENDORS
    // ==========================================
    @Transactional(readOnly = true)
    public List<VendorDto> getVerifiedVendors() {
        return vendorRepository.findByVerificationStatus(VendorVerificationStatus.VERIFIED).stream()
                .map(VendorDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VendorDto> getPendingVendors() {
        return vendorRepository.findByVerificationStatus(VendorVerificationStatus.PENDING).stream()
                .map(VendorDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VendorDetailAdminDto getVendorDetail(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));

        List<ProductServiceDto> products = productServiceRepository.findByVendorId(vendorId).stream()
                .map(ProductServiceDto::fromEntity)
                .collect(Collectors.toList());

        List<Inquiry> inquiries = inquiryRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
        long pendingInquiries = inquiries.stream().filter(i -> i.getStatus() == InquiryStatus.PENDING).count();
        long respondedInquiries = inquiries.stream().filter(i -> i.getStatus() == InquiryStatus.RESPONDED).count();
        long closedInquiries = inquiries.stream().filter(i -> i.getStatus() == InquiryStatus.CLOSED).count();

        VendorDetailAdminDto.InquiriesSummary inqSummary = VendorDetailAdminDto.InquiriesSummary.builder()
                .total(inquiries.size())
                .pending(pendingInquiries)
                .responded(respondedInquiries)
                .closed(closedInquiries)
                .build();

List<JobOpeningDto> jobs = jobOpeningRepository.findByVendorId(vendorId).stream()
        .map(job -> {
            JobOpeningDto dto = JobOpeningDto.fromEntity(job);

            long count = jobApplicationRepository.countByJobOpening_Id(job.getId());
            dto.setApplicationsCount(count);

            return dto;
        })
        .collect(Collectors.toList());

        List<JobApplication> allVendorApps = jobs.stream()
                .flatMap(j -> jobApplicationRepository.findByJobOpeningId(j.getId()).stream())
                .collect(Collectors.toList());

        long pendingApps = allVendorApps.stream().filter(a -> a.getStatus() == JobApplicationStatus.APPLIED || a.getStatus() == JobApplicationStatus.SHORTLISTED).count();
        long acceptedApps = allVendorApps.stream().filter(a -> a.getStatus() == JobApplicationStatus.ACCEPTED).count();
        long rejectedApps = allVendorApps.stream().filter(a -> a.getStatus() == JobApplicationStatus.REJECTED).count();

        VendorDetailAdminDto.ApplicationsSummary appSummary = VendorDetailAdminDto.ApplicationsSummary.builder()
                .total(allVendorApps.size())
                .pending(pendingApps)
                .accepted(acceptedApps)
                .rejected(rejectedApps)
                .build();

        return VendorDetailAdminDto.builder()
                .vendor(VendorDto.fromEntity(vendor))
                .productsAndServices(products)
                .inquiriesSummary(inqSummary)
                .jobOpenings(jobs)
                .applicationsSummary(appSummary)
                .build();
    }

    @Transactional
    public VendorDto approveVendor(Long vendorId, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));

        vendor.setVerificationStatus(VendorVerificationStatus.VERIFIED);
        vendor.setVendorStatus(VendorStatus.ACTIVE);
        vendor.setVerifiedAt(LocalDateTime.now());
        vendor.setRejectionReason(null);

        Vendor updated = vendorRepository.save(vendor);
        logAction(adminId, "APPROVE_VENDOR", "Vendor", vendorId, "Approved vendor: " + vendor.getBusinessName());
        return VendorDto.fromEntity(updated);
    }

    @Transactional
    public VendorDto rejectVendor(Long vendorId, String rejectionReason, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }

        vendor.setVerificationStatus(VendorVerificationStatus.REJECTED);
        vendor.setRejectionReason(rejectionReason);

        Vendor updated = vendorRepository.save(vendor);
        logAction(adminId, "REJECT_VENDOR", "Vendor", vendorId, "Rejected vendor: " + vendor.getBusinessName() + " | Reason: " + rejectionReason);
        return VendorDto.fromEntity(updated);
    }

    @Transactional
    public VendorDto requestVendorChanges(Long vendorId, String message, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));

        if (message == null || message.isBlank()) {
            throw new BadRequestException("Change request message is required");
        }

        vendor.setVerificationStatus(VendorVerificationStatus.CHANGES_REQUIRED);
        vendor.setRejectionReason(message);

        Vendor updated = vendorRepository.save(vendor);
        logAction(adminId, "REQUEST_VENDOR_CHANGES", "Vendor", vendorId, "Requested changes for vendor: " + vendor.getBusinessName() + " | Details: " + message);
        return VendorDto.fromEntity(updated);
    }

    @Transactional
    public VendorDto suspendVendor(Long vendorId, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));

        vendor.setVendorStatus(VendorStatus.SUSPENDED);
        Vendor updated = vendorRepository.save(vendor);

        logAction(adminId, "SUSPEND_VENDOR", "Vendor", vendorId, "Suspended vendor: " + vendor.getBusinessName());
        return VendorDto.fromEntity(updated);
    }

    @Transactional
    public VendorDto reactivateVendor(Long vendorId, Long adminId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));

        vendor.setVendorStatus(VendorStatus.ACTIVE);
        Vendor updated = vendorRepository.save(vendor);

        logAction(adminId, "REACTIVATE_VENDOR", "Vendor", vendorId, "Reactivated vendor: " + vendor.getBusinessName());
        return VendorDto.fromEntity(updated);
    }

    // ==========================================
    // 5. CATEGORIES
    // ==========================================
    @Transactional(readOnly = true)
    public List<CategoryWithStatsDto> getCategoriesWithStats() {
        return categoryRepository.findAll().stream().map(cat -> {
            long ideasCount = businessIdeaRepository.findByCategoryAndStatus(cat, BusinessIdeaStatus.PUBLISHED).size()
                    + businessIdeaRepository.findByCategoryAndStatus(cat, BusinessIdeaStatus.DRAFT).size();
            long vendorsCount = vendorRepository.findAll().stream()
                    .filter(v -> v.getCategory() != null && v.getCategory().getId().equals(cat.getId()))
                    .count();

            return CategoryWithStatsDto.builder()
                    .id(cat.getId())
                    .name(cat.getName())
                    .description(cat.getDescription())
                    .status(cat.getStatus())
                    .numberOfIdeas(ideasCount)
                    .numberOfVendors(vendorsCount)
                    .createdAt(cat.getCreatedAt())
                    .updatedAt(cat.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto, Long adminId) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : CategoryStatus.ACTIVE)
                .build();

        Category saved = categoryRepository.save(category);
        logAction(adminId, "CREATE_CATEGORY", "Category", saved.getId(), "Created category: " + saved.getName());
        return CategoryDto.fromEntity(saved);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto, Long adminId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (dto.getName() != null && !dto.getName().equalsIgnoreCase(category.getName())) {
            if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
                throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
            }
            category.setName(dto.getName());
        }

        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        if (dto.getStatus() != null) category.setStatus(dto.getStatus());

        Category updated = categoryRepository.save(category);
        logAction(adminId, "UPDATE_CATEGORY", "Category", id, "Updated category: " + updated.getName());
        return CategoryDto.fromEntity(updated);
    }

@Transactional
public CategoryDto updateCategoryStatus(
        Long id,
        CategoryStatus status,
        Long adminId) {

    Category category = categoryRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Category not found with id: " + id));

    category.setStatus(status);

    Category updated = categoryRepository.save(category);

    logAction(
            adminId,
            "UPDATE_CATEGORY_STATUS",
            "Category",
            id,
            "Changed category status to: " + status
    );

    return CategoryDto.fromEntity(updated);
}

    @Transactional
    public void deleteCategory(Long id, Long adminId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        boolean inUseIdeas = !businessIdeaRepository.findByCategoryIdAndStatus(id, BusinessIdeaStatus.PUBLISHED).isEmpty()
                || !businessIdeaRepository.findByCategoryIdAndStatus(id, BusinessIdeaStatus.DRAFT).isEmpty();
        boolean inUseVendors = vendorRepository.findAll().stream()
                .anyMatch(v -> v.getCategory() != null && v.getCategory().getId().equals(id));

        if (inUseIdeas || inUseVendors) {
            throw new BadRequestException("Cannot delete category currently in use by business ideas or vendors. Deactivate it instead.");
        }

        categoryRepository.delete(category);
        logAction(adminId, "DELETE_CATEGORY", "Category", id, "Deleted category: " + category.getName());
    }

    // ==========================================
    // 6. INQUIRIES & AUDIT LOGS
    // ==========================================
    @Transactional(readOnly = true)
    public List<InquiryDto> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(InquiryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogDto> getAuditLogs() {
        return adminAuditLogRepository.findAll().stream()
                .map(AdminAuditLogDto::fromEntity)
                .collect(Collectors.toList());
    }

    private void logAction(Long adminId, String action, String entityType, Long entityId, String description) {
        userRepository.findById(adminId).ifPresent(admin -> {
            AdminAuditLog log = AdminAuditLog.builder()
                    .admin(admin)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .build();
            adminAuditLogRepository.save(log);
        });
    }
}
