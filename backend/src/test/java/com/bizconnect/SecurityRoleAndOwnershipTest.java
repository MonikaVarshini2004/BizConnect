package com.bizconnect;

import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.*;
import com.bizconnect.repository.*;
import com.bizconnect.security.jwt.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityRoleAndOwnershipTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BusinessIdeaRepository businessIdeaRepository;

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    private String user1Token;
    private String user2Token;
    private String vendor1Token;
    private String vendor2Token;
    private String adminToken;

    private Long vendor1ServiceId;
    private Long user1InquiryId;

    @BeforeEach
    void setup() {
        adminAuditLogRepository.deleteAll();
        jobApplicationRepository.deleteAll();
        jobOpeningRepository.deleteAll();
        inquiryRepository.deleteAll();
        productServiceRepository.deleteAll();
        businessIdeaRepository.deleteAll();
        vendorRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
        User user1 = userRepository.save(User.builder()
                .username("regular_user1")
                .email("user1@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        User user2 = userRepository.save(User.builder()
                .username("regular_user2")
                .email("user2@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        User vendorUser1 = userRepository.save(User.builder()
                .username("vendor_user1")
                .email("vendor1@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.VENDOR)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        User vendorUser2 = userRepository.save(User.builder()
                .username("vendor_user2")
                .email("vendor2@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.VENDOR)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        User adminUser = userRepository.save(User.builder()
                .username("admin_user")
                .email("admin@bizconnect.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // 2. Generate Real JWT Tokens
        user1Token = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(user1.getUsername(), List.of("ROLE_USER"));
        user2Token = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(user2.getUsername(), List.of("ROLE_USER"));
        vendor1Token = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(vendorUser1.getUsername(), List.of("ROLE_VENDOR"));
        vendor2Token = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(vendorUser2.getUsername(), List.of("ROLE_VENDOR"));
        adminToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(adminUser.getUsername(), List.of("ROLE_ADMIN"));

        // 3. Create Categories
        Category cat = categoryRepository.save(Category.builder()
                .name("IT & Cloud Services")
                .description("Cloud computing and enterprise tools")
                .status(CategoryStatus.ACTIVE)
                .build());

        // 4. Create Vendors
        Vendor vendor1 = vendorRepository.save(Vendor.builder()
                .user(vendorUser1)
                .businessName("Vendor 1 Apex Cloud")
                .category(cat)
                .verificationStatus(VendorVerificationStatus.VERIFIED)
                .vendorStatus(VendorStatus.ACTIVE)
                .verifiedAt(LocalDateTime.now())
                .build());

        Vendor vendor2 = vendorRepository.save(Vendor.builder()
                .user(vendorUser2)
                .businessName("Vendor 2 Cyber Dynamics")
                .category(cat)
                .verificationStatus(VendorVerificationStatus.VERIFIED)
                .vendorStatus(VendorStatus.ACTIVE)
                .verifiedAt(LocalDateTime.now())
                .build());

        // 5. Create Service owned by Vendor 1
        ProductService service1 = productServiceRepository.save(ProductService.builder()
                .vendor(vendor1)
                .name("Managed Kubernetes Hosting")
                .category(cat)
                .price(new BigDecimal("499.00"))
                .status(ProductServiceStatus.APPROVED)
                .build());
        vendor1ServiceId = service1.getId();

        // 6. Create Published Business Idea
        businessIdeaRepository.save(BusinessIdea.builder()
                .name("NextGen SaaS Billing Engine")
                .category(cat)
                .shortDescription("Subscription billing engine")
                .status(BusinessIdeaStatus.PUBLISHED)
                .createdBy(adminUser)
                .build());

        // 7. Create Inquiry owned by User 1
        Inquiry inquiry1 = inquiryRepository.save(Inquiry.builder()
                .user(user1)
                .vendor(vendor1)
                .message("Inquiring about enterprise hosting plan pricing.")
                .status(InquiryStatus.PENDING)
                .build());
        user1InquiryId = inquiry1.getId();
    }

    @Test
    @DisplayName("1. USER -> ADMIN API -> 403 Forbidden")
    void testUserCannotAccessAdminApi() throws Exception {
        mockMvc.perform(get("/api/admin/summary")
                        .header("Authorization", user1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("2. USER -> VENDOR management API -> 403 Forbidden")
    void testUserCannotAccessVendorApi() throws Exception {
        mockMvc.perform(get("/api/vendor/services")
                        .header("Authorization", user1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. VENDOR -> ADMIN API -> 403 Forbidden")
    void testVendorCannotAccessAdminApi() throws Exception {
        mockMvc.perform(get("/api/admin/summary")
                        .header("Authorization", vendor1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. VENDOR -> another vendor's service -> 403 Forbidden (Critical Ownership Check)")
    void testVendorCannotAccessAnotherVendorsService() throws Exception {
        // Vendor 2 tries to access Vendor 1's service
        mockMvc.perform(get("/api/vendor/services/" + vendor1ServiceId)
                        .header("Authorization", vendor2Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @DisplayName("5. USER -> another user's inquiry -> 403 Forbidden (Critical Ownership Check)")
    void testUserCannotAccessAnotherUsersInquiry() throws Exception {
        // User 2 tries to access User 1's inquiry
        mockMvc.perform(get("/api/inquiries/" + user1InquiryId)
                        .header("Authorization", user2Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @DisplayName("6. Unauthenticated -> protected API -> 401 Unauthorized")
    void testUnauthenticatedUserRejectedWith401() throws Exception {
        mockMvc.perform(get("/api/admin/summary"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        mockMvc.perform(get("/api/vendor/services"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("7. ADMIN -> admin API -> allowed (200 OK)")
    void testAdminCanAccessAdminApi() throws Exception {
        mockMvc.perform(get("/api/admin/summary")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").exists())
                .andExpect(jsonPath("$.totalVendors").exists());
    }

    @Test
    @DisplayName("8. USER -> published ideas -> allowed (200 OK)")
    void testUserCanAccessPublishedIdeas() throws Exception {
        mockMvc.perform(get("/api/ideas")
                        .header("Authorization", user1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("NextGen SaaS Billing Engine"));
    }

    @Test
    @DisplayName("9. USER -> verified vendors -> allowed (200 OK)")
    void testUserCanAccessVerifiedVendors() throws Exception {
        mockMvc.perform(get("/api/public/vendors")
                        .header("Authorization", user1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].businessName").exists());
    }

    @Test
    @DisplayName("10. VENDOR -> own services -> allowed (200 OK)")
    void testVendorCanAccessOwnServices() throws Exception {
        // Vendor 1 accesses their own services list
        mockMvc.perform(get("/api/vendor/services")
                        .header("Authorization", vendor1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Managed Kubernetes Hosting"));

        // Vendor 1 accesses their own single service
        mockMvc.perform(get("/api/vendor/services/" + vendor1ServiceId)
                        .header("Authorization", vendor1Token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Managed Kubernetes Hosting"));
    }
}
