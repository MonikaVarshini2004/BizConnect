package com.bizconnect;

import com.bizconnect.dto.UserResponseDto;
import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.*;
import com.bizconnect.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DomainModelMappingTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BusinessIdeaRepository businessIdeaRepository;

    @Autowired
    private VendorRepository vendorRepository;

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

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testDomainModelPersistenceAndRelationships() throws Exception {
        // 1. Create Users (User, Vendor User, Admin)
        User regularUser = userRepository.save(User.builder()
                .username("john_doe")
                .email("john@example.com")
                .password("$2a$10$encodedPasswordHash")
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
        assertNotNull(regularUser.getId());
        assertNotNull(regularUser.getCreatedAt());

        User vendorUser = userRepository.save(User.builder()
                .username("tech_corp_user")
                .email("vendor@techcorp.com")
                .password("$2a$10$encodedPasswordHash")
                .role(Role.VENDOR)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
        assertNotNull(vendorUser.getId());

        User adminUser = userRepository.save(User.builder()
                .username("super_admin")
                .email("admin@bizconnect.com")
                .password("$2a$10$encodedPasswordHash")
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
        assertNotNull(adminUser.getId());

        // 2. Verify Password is not serialized to JSON
        String userJson = objectMapper.writeValueAsString(regularUser);
        assertFalse(userJson.contains("$2a$10$encodedPasswordHash"), "Password must not be exposed in JSON");

        UserResponseDto userDto = UserResponseDto.fromEntity(regularUser);
        assertEquals("john_doe", userDto.getUsername());

        // 3. Create Category
        Category techCategory = categoryRepository.save(Category.builder()
                .name("Technology & Software")
                .description("IT, Software and Tech Services")
                .status(CategoryStatus.ACTIVE)
                .build());
        assertNotNull(techCategory.getId());

        // 4. Create Business Idea
        BusinessIdea idea = businessIdeaRepository.save(BusinessIdea.builder()
                .name("Cloud-Based ERP Solution")
                .category(techCategory)
                .shortDescription("Affordable ERP for small enterprises")
                .detailedDescription("Modular cloud system with finance, HR, inventory")
                .investmentRange("$10,000 - $25,000")
                .expectedProfit("35% ROI in Year 1")
                .requiredSkills("Java, React, Cloud Hosting")
                .riskLevel("MEDIUM")
                .tags("SaaS, Cloud, ERP")
                .status(BusinessIdeaStatus.PUBLISHED)
                .createdBy(adminUser)
                .build());
        assertNotNull(idea.getId());
        assertEquals("Technology & Software", idea.getCategory().getName());

        // 5. Create Vendor
        Vendor vendor = vendorRepository.save(Vendor.builder()
                .user(vendorUser)
                .businessName("TechCorp Solutions")
                .ownerName("Alice Smith")
                .email("contact@techcorp.com")
                .phone("+1234567890")
                .address("123 Tech Park, Silicon Valley")
                .description("Specialized enterprise software developer")
                .category(techCategory)
                .verificationStatus(VendorVerificationStatus.VERIFIED)
                .vendorStatus(VendorStatus.ACTIVE)
                .verifiedAt(LocalDateTime.now())
                .build());
        assertNotNull(vendor.getId());
        assertEquals(vendorUser.getId(), vendor.getUser().getId());

        // 6. Create Product / Service
        ProductService product = productServiceRepository.save(ProductService.builder()
                .vendor(vendor)
                .name("Custom CRM Module")
                .category(techCategory)
                .description("Turnkey CRM module tailored for sales teams")
                .price(new BigDecimal("1499.99"))
                .priceRange("$1000 - $2000")
                .availability("Available in 2 weeks")
                .status(ProductServiceStatus.APPROVED)
                .build());
        assertNotNull(product.getId());
        assertEquals("TechCorp Solutions", product.getVendor().getBusinessName());

        // 7. Create Inquiry
        Inquiry inquiry = inquiryRepository.save(Inquiry.builder()
                .user(regularUser)
                .vendor(vendor)
                .businessIdea(idea)
                .message("We are interested in integrating your CRM module with our ERP plan.")
                .status(InquiryStatus.PENDING)
                .build());
        assertNotNull(inquiry.getId());
        assertEquals(regularUser.getId(), inquiry.getUser().getId());
        assertEquals(vendor.getId(), inquiry.getVendor().getId());
        assertEquals(idea.getId(), inquiry.getBusinessIdea().getId());

        // 8. Create Job Opening
        JobOpening jobOpening = jobOpeningRepository.save(JobOpening.builder()
                .vendor(vendor)
                .title("Senior Full Stack Java/React Engineer")
                .description("Lead developer for SaaS platform development")
                .requiredSkills("Java, Spring Boot, React, MySQL")
                .location("Remote / Hybrid")
                .openings(2)
                .status(JobOpeningStatus.OPEN)
                .closingDate(LocalDate.now().plusMonths(1))
                .build());
        assertNotNull(jobOpening.getId());
        assertEquals(vendor.getId(), jobOpening.getVendor().getId());

        // 9. Create Job Application
        JobApplication application = jobApplicationRepository.save(JobApplication.builder()
                .jobOpening(jobOpening)
                .user(regularUser)
                .applicationMessage("Experienced full stack developer excited to apply!")
                .status(JobApplicationStatus.APPLIED)
                .build());
        assertNotNull(application.getId());
        assertEquals(jobOpening.getId(), application.getJobOpening().getId());
        assertEquals(regularUser.getId(), application.getUser().getId());

        // 10. Create Admin Audit Log
        AdminAuditLog auditLog = adminAuditLogRepository.save(AdminAuditLog.builder()
                .admin(adminUser)
                .action("VERIFY_VENDOR")
                .entityType("Vendor")
                .entityId(vendor.getId())
                .description("Vendor TechCorp Solutions verified successfully by admin")
                .build());
        assertNotNull(auditLog.getId());
        assertEquals(adminUser.getId(), auditLog.getAdmin().getId());
    }
}
