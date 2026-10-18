package com.bizconnect;

import com.bizconnect.dto.*;
import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.*;
import com.bizconnect.repository.*;
import com.bizconnect.security.dto.LoginRequest;
import com.bizconnect.security.dto.RegisterRequest;
import com.bizconnect.security.jwt.JwtUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EndToEndIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    }

    // ==========================================
    // 1. COMPLETE USER FLOW TEST
    // ==========================================
    @Test
    @DisplayName("USER E2E Flow: Login -> Dashboard -> Search Ideas -> View Details & Vendors -> Send Inquiry -> View Inquiries -> See Vendor Response")
    void testCompleteUserFlow() throws Exception {
        // Setup Category
        Category category = categoryRepository.save(Category.builder()
                .name("Eco-Tech Solutions")
                .description("Sustainable and green technologies")
                .status(CategoryStatus.ACTIVE)
                .build());

        // Setup Admin (as creator of ideas)
        User adminUser = userRepository.save(User.builder()
                .username("system_admin")
                .email("admin@system.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // Setup Idea
        BusinessIdea idea = businessIdeaRepository.save(BusinessIdea.builder()
                .name("Solar Microgrid Setup")
                .category(category)
                .shortDescription("Decentralized solar charging stations")
                .detailedDescription("Complete turnkey solar microgrid with battery storage systems.")
                .investmentRange("$15,000 - $30,000")
                .expectedProfit("25-30% ROI")
                .riskLevel("Low")
                .requiredSkills("Electrical engineering, Project management")
                .tags("solar,clean-energy,greentech")
                .status(BusinessIdeaStatus.PUBLISHED)
                .createdBy(adminUser)
                .build());

        // Setup Vendor User & Verified Vendor
        User vendorUser = userRepository.save(User.builder()
                .username("sunpower_vendor")
                .email("vendor@sunpower.com")
                .password(passwordEncoder.encode("Vendor@123"))
                .role(Role.VENDOR)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        Vendor vendor = vendorRepository.save(Vendor.builder()
                .user(vendorUser)
                .businessName("SunPower Systems Ltd")
                .ownerName("Alice Smith")
                .category(category)
                .description("Commercial solar panel equipment and inverters.")
                .verificationStatus(VendorVerificationStatus.VERIFIED)
                .vendorStatus(VendorStatus.ACTIVE)
                .build());

        // Setup User Registration / Account
        User user = userRepository.save(User.builder()
                .username("john_entrepreneur")
                .email("john@innovate.com")
                .password(passwordEncoder.encode("User@123"))
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // 1. USER LOGIN
        LoginRequest loginReq = new LoginRequest("john_entrepreneur", "User@123");
        String loginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role", containsString("USER")))
                .andReturn().getResponse().getContentAsString();

        Map<String, Object> loginMap = objectMapper.readValue(loginRes, new TypeReference<>() {});
        String userToken = "Bearer " + loginMap.get("token");

        // 2. USER DASHBOARD SUMMARY
        mockMvc.perform(get("/api/user/summary")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableIdeas", is(1)))
                .andExpect(jsonPath("$.verifiedVendors", is(1)))
                .andExpect(jsonPath("$.myInquiries", is(0)));

        // 3. BROWSE BUSINESS IDEAS
        mockMvc.perform(get("/api/ideas")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Solar Microgrid Setup")));

        // 4. SEARCH / FILTER IDEAS
        mockMvc.perform(get("/api/ideas/" + idea.getId())
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Solar Microgrid Setup")))
                .andExpect(jsonPath("$.investmentRange", is("$15,000 - $30,000")));

        // 5. VIEW VERIFIED VENDORS FOR THIS IDEA
        mockMvc.perform(get("/api/vendors/by-idea/" + idea.getId())
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyName", is("SunPower Systems Ltd")))
                .andExpect(jsonPath("$[0].verificationStatus", is("VERIFIED")));

        // 6. SEND INQUIRY
        CreateInquiryRequest inquiryReq = new CreateInquiryRequest(
                vendor.getId(),
                idea.getId(),
                "We need 50kW solar inverters and battery packs for a Q4 deployment. Can you provide a quotation?"
        );

        String inqRes = mockMvc.perform(post("/api/inquiries")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inquiryReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andReturn().getResponse().getContentAsString();

        InquiryDto createdInquiry = objectMapper.readValue(inqRes, InquiryDto.class);

        // 7. USER SEES INQUIRY IN MY INQUIRIES
        mockMvc.perform(get("/api/inquiries/user")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status", is("PENDING")));

        // 8. VENDOR RESPONDS TO INQUIRY
        String vendorToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(vendorUser.getUsername(), List.of("ROLE_VENDOR"));
        RespondInquiryRequest respondReq = new RespondInquiryRequest(
                createdInquiry.getId(),
                "We have 50kW Tier-1 inverters in stock ready for immediate dispatch.",
                new BigDecimal("18500.00"),
                "2 weeks lead time with on-site warranty"
        );

        mockMvc.perform(post("/api/inquiries/respond")
                        .header("Authorization", vendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(respondReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESPONDED")))
                .andExpect(jsonPath("$.quotedPrice", is(18500.00)));

        // 9. USER SEES VENDOR RESPONSE
        mockMvc.perform(get("/api/inquiries/" + createdInquiry.getId())
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESPONDED")))
                .andExpect(jsonPath("$.vendorResponse", containsString("50kW Tier-1 inverters in stock")))
                .andExpect(jsonPath("$.quotedPrice", is(18500.00)))
                .andExpect(jsonPath("$.deliveryInformation", containsString("2 weeks lead time")));
    }

    // ==========================================
    // 2. COMPLETE VENDOR FLOW TEST
    // ==========================================
    @Test
    @DisplayName("VENDOR E2E Flow: Registration -> Pending -> Admin Approval -> Verified Dashboard -> Add Service -> Respond Inquiry")
    void testCompleteVendorFlow() throws Exception {
        // Setup Admin
        User adminUser = userRepository.save(User.builder()
                .username("system_admin")
                .email("admin@bizconnect.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
        String adminToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(adminUser.getUsername(), List.of("ROLE_ADMIN"));

        // Setup Category
        Category category = categoryRepository.save(Category.builder()
                .name("Cloud & IT Infrastructure")
                .status(CategoryStatus.ACTIVE)
                .build());

        // 1. VENDOR REGISTRATION
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setUsername("apex_cloud_vendor");
        registerReq.setEmail("info@apexcloud.io");
        registerReq.setPassword("Password@123");
        registerReq.setRole(Role.VENDOR);
        registerReq.setBusinessName("Apex Cloud Infrastructure");
        registerReq.setOwnerName("Robert Davis");
        registerReq.setPhone("+1-555-0199");
        registerReq.setCategoryId(category.getId());
        registerReq.setDescription("Enterprise Kubernetes and multi-cloud solutions.");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is("apex_cloud_vendor")))
                .andExpect(jsonPath("$.role", containsString("VENDOR")));

        Vendor pendingVendor = vendorRepository.findByBusinessName("Apex Cloud Infrastructure").orElseThrow();
        assertEquals(VendorVerificationStatus.PENDING, pendingVendor.getVerificationStatus());

        // 2. ADMIN APPROVES VENDOR
        mockMvc.perform(put("/api/admin/vendors/" + pendingVendor.getId() + "/approve")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("notes", "All business documents verified."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("VERIFIED")))
                .andExpect(jsonPath("$.vendorStatus", is("ACTIVE")));

        // 3. VENDOR ADDS SERVICE
        String vendorToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles("apex_cloud_vendor", List.of("ROLE_VENDOR"));

        ProductServiceDto newService = ProductServiceDto.builder()
                .name("Managed Kubernetes Cluster")
                .categoryId(category.getId())
                .description("Production-ready 99.99% SLA Kubernetes cluster setup.")
                .price(new BigDecimal("3500.00"))
                .priceRange("$3,000 - $4,500")
                .availability("Available in 48h")
                .build();

        mockMvc.perform(post("/api/vendor/services")
                        .header("Authorization", vendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newService)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Managed Kubernetes Cluster")));

        // 4. VENDOR PROFILE RETRIEVAL
        mockMvc.perform(get("/api/vendor/profile")
                        .header("Authorization", vendorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName", is("Apex Cloud Infrastructure")))
                .andExpect(jsonPath("$.verificationStatus", is("VERIFIED")));
    }

    // ==========================================
    // 3. COMPLETE ADMIN FLOW TEST
    // ==========================================
    @Test
    @DisplayName("ADMIN E2E Flow: Admin Dashboard -> View Users -> Create & Publish Idea -> View & Reject/Approve Vendors -> Manage Categories -> Audit Logs")
    void testCompleteAdminFlow() throws Exception {
        User adminUser = userRepository.save(User.builder()
                .username("super_admin")
                .email("admin@bizconnect.io")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
        String adminToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(adminUser.getUsername(), List.of("ROLE_ADMIN"));

        // 1. ADMIN DASHBOARD SUMMARY
        mockMvc.perform(get("/api/admin/summary")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers", is(1)))
                .andExpect(jsonPath("$.businessIdeas", is(0)));

        // 2. CREATE CATEGORY
        CategoryDto catDto = new CategoryDto();
        catDto.setName("Biotech & HealthTech");
        catDto.setDescription("Medical devices and diagnostics");
        catDto.setStatus(CategoryStatus.ACTIVE);

        String catRes = mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Biotech & HealthTech")))
                .andReturn().getResponse().getContentAsString();

        CategoryDto createdCat = objectMapper.readValue(catRes, CategoryDto.class);

        // 3. CREATE & PUBLISH BUSINESS IDEA
        BusinessIdeaDto ideaDto = BusinessIdeaDto.builder()
                .name("Telehealth Diagnostic Kiosks")
                .categoryId(createdCat.getId())
                .shortDescription("Automated clinic kiosks for rural healthcare")
                .detailedDescription("Remote health monitoring kiosks with integrated diagnostic sensors.")
                .investmentRange("$20,000 - $50,000")
                .expectedProfit("35% Annual Margin")
                .status(BusinessIdeaStatus.DRAFT)
                .build();

        String ideaRes = mockMvc.perform(post("/api/admin/ideas")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ideaDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andReturn().getResponse().getContentAsString();

        BusinessIdeaDto createdIdea = objectMapper.readValue(ideaRes, BusinessIdeaDto.class);

        // Publish idea
        mockMvc.perform(put("/api/admin/ideas/" + createdIdea.getId() + "/publish")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PUBLISHED")));

        // 4. VIEW AUDIT LOGS
        mockMvc.perform(get("/api/admin/audit-logs")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    // ==========================================
    // 4. CRITICAL STATE VISIBILITY TESTS
    // ==========================================
    @Test
    @DisplayName("Critical State Visibility: Non-published ideas and non-verified/suspended vendors MUST NOT be visible to USER")
    void testCriticalStateVisibility() throws Exception {
        Category category = categoryRepository.save(Category.builder().name("General Retail").status(CategoryStatus.ACTIVE).build());

        User adminUser = userRepository.save(User.builder().username("admin_fixture").email("admin@fix.com").password(passwordEncoder.encode("password123")).role(Role.ADMIN).accountStatus(AccountStatus.ACTIVE).build());

        // 1. DRAFT & ARCHIVED Ideas
        BusinessIdea draftIdea = businessIdeaRepository.save(BusinessIdea.builder()
                .name("Secret Unreleased Idea")
                .category(category)
                .shortDescription("Draft concept")
                .status(BusinessIdeaStatus.DRAFT)
                .createdBy(adminUser)
                .build());

        BusinessIdea archivedIdea = businessIdeaRepository.save(BusinessIdea.builder()
                .name("Discontinued Idea")
                .category(category)
                .shortDescription("Archived concept")
                .status(BusinessIdeaStatus.ARCHIVED)
                .createdBy(adminUser)
                .build());

        BusinessIdea publishedIdea = businessIdeaRepository.save(BusinessIdea.builder()
                .name("Active Public Idea")
                .category(category)
                .shortDescription("Published concept")
                .status(BusinessIdeaStatus.PUBLISHED)
                .createdBy(adminUser)
                .build());

        // 2. Vendors in different states
        User u1 = userRepository.save(User.builder().username("vendor_one").email("v1@t.com").password(passwordEncoder.encode("password123")).role(Role.VENDOR).accountStatus(AccountStatus.ACTIVE).build());
        User u2 = userRepository.save(User.builder().username("vendor_two").email("v2@t.com").password(passwordEncoder.encode("password123")).role(Role.VENDOR).accountStatus(AccountStatus.ACTIVE).build());
        User u3 = userRepository.save(User.builder().username("vendor_three").email("v3@t.com").password(passwordEncoder.encode("password123")).role(Role.VENDOR).accountStatus(AccountStatus.ACTIVE).build());
        User u4 = userRepository.save(User.builder().username("vendor_four").email("v4@t.com").password(passwordEncoder.encode("password123")).role(Role.VENDOR).accountStatus(AccountStatus.ACTIVE).build());

        // Pending Vendor
        vendorRepository.save(Vendor.builder().user(u1).businessName("Pending Vendor Inc").category(category).verificationStatus(VendorVerificationStatus.PENDING).vendorStatus(VendorStatus.ACTIVE).build());
        // Rejected Vendor
        vendorRepository.save(Vendor.builder().user(u2).businessName("Rejected Vendor Inc").category(category).verificationStatus(VendorVerificationStatus.REJECTED).vendorStatus(VendorStatus.ACTIVE).build());
        // Suspended Vendor
        vendorRepository.save(Vendor.builder().user(u3).businessName("Suspended Vendor Inc").category(category).verificationStatus(VendorVerificationStatus.VERIFIED).vendorStatus(VendorStatus.SUSPENDED).build());
        // Verified & Active Vendor
        vendorRepository.save(Vendor.builder().user(u4).businessName("Verified Active Vendor Inc").category(category).verificationStatus(VendorVerificationStatus.VERIFIED).vendorStatus(VendorStatus.ACTIVE).build());

        // USER token
        User user = userRepository.save(User.builder().username("regular_user").email("reg@t.com").password(passwordEncoder.encode("password123")).role(Role.USER).accountStatus(AccountStatus.ACTIVE).build());
        String userToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(user.getUsername(), List.of("ROLE_USER"));

        // VERIFY: USER only sees PUBLISHED ideas
        mockMvc.perform(get("/api/ideas")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Active Public Idea")));

        // VERIFY: USER cannot fetch DRAFT or ARCHIVED idea by ID (returns 404)
        mockMvc.perform(get("/api/ideas/" + draftIdea.getId())
                        .header("Authorization", userToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/ideas/" + archivedIdea.getId())
                        .header("Authorization", userToken))
                .andExpect(status().isNotFound());

        // VERIFY: USER only sees VERIFIED + ACTIVE vendors
        mockMvc.perform(get("/api/vendors")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyName", is("Verified Active Vendor Inc")));
    }

    // ==========================================
    // 5. SECURITY & ROLE AUTHORIZATION TESTS
    // ==========================================
    @Test
    @DisplayName("Role & Ownership Security: 401 Unauthorized for Unauthenticated, 403 Forbidden for cross-role or cross-user access")
    void testSecurityAndAuthorization() throws Exception {
        User user1 = userRepository.save(User.builder().username("user_one").email("u1@test.com").password(passwordEncoder.encode("password123")).role(Role.USER).accountStatus(AccountStatus.ACTIVE).build());
        User user2 = userRepository.save(User.builder().username("user_two").email("u2@test.com").password(passwordEncoder.encode("password123")).role(Role.USER).accountStatus(AccountStatus.ACTIVE).build());
        User vendorUser = userRepository.save(User.builder().username("vendor_one").email("v1@test.com").password(passwordEncoder.encode("password123")).role(Role.VENDOR).accountStatus(AccountStatus.ACTIVE).build());

        String user1Token = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(user1.getUsername(), List.of("ROLE_USER"));
        String vendorToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(vendorUser.getUsername(), List.of("ROLE_VENDOR"));

        // 1. Unauthenticated -> 401
        mockMvc.perform(get("/api/admin/summary"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/user/profile"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/vendor/profile"))
                .andExpect(status().isUnauthorized());

        // 2. USER -> ADMIN endpoint = 403 Forbidden
        mockMvc.perform(get("/api/admin/summary")
                        .header("Authorization", user1Token))
                .andExpect(status().isForbidden());

        // 3. USER -> VENDOR endpoint = 403 Forbidden
        mockMvc.perform(get("/api/vendor/profile")
                        .header("Authorization", user1Token))
                .andExpect(status().isForbidden());

        // 4. VENDOR -> ADMIN endpoint = 403 Forbidden
        mockMvc.perform(get("/api/admin/summary")
                        .header("Authorization", vendorToken))
                .andExpect(status().isForbidden());

        // 5. USER -> another USER's private inquiry = 403 Forbidden
        Category category = categoryRepository.save(Category.builder().name("IT").status(CategoryStatus.ACTIVE).build());
        Vendor vendor = vendorRepository.save(Vendor.builder().user(vendorUser).businessName("Tech Corp").category(category).verificationStatus(VendorVerificationStatus.VERIFIED).vendorStatus(VendorStatus.ACTIVE).build());
        Inquiry user2Inquiry = inquiryRepository.save(Inquiry.builder().user(user2).vendor(vendor).message("Private inquiry of user 2").status(InquiryStatus.PENDING).build());

        mockMvc.perform(get("/api/inquiries/" + user2Inquiry.getId())
                        .header("Authorization", user1Token))
                .andExpect(status().isForbidden());
    }
}
