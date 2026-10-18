package com.bizconnect;

import com.bizconnect.dto.*;
import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.*;
import com.bizconnect.repository.*;
import com.bizconnect.security.jwt.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RestApiEndpointsTest {

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

    private String userToken;
    private String vendorToken;
    private String adminToken;

    private Long userId;
    private Long vendorUserId;
    private Long vendorId;
    private Long categoryId;
    private Long publishedIdeaId;

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
        User user = userRepository.save(User.builder()
                .username("jane_user")
                .email("jane@example.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
        userId = user.getId();

        User vendorUser = userRepository.save(User.builder()
                .username("apex_vendor_user")
                .email("apex@vendor.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.VENDOR)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
        vendorUserId = vendorUser.getId();

        User adminUser = userRepository.save(User.builder()
                .username("master_admin")
                .email("admin@bizconnect.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // 2. Tokens
        userToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(user.getUsername(), List.of("ROLE_USER"));
        vendorToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(vendorUser.getUsername(), List.of("ROLE_VENDOR"));
        adminToken = "Bearer " + jwtUtils.generateTokenFromUsernameAndRoles(adminUser.getUsername(), List.of("ROLE_ADMIN"));

        // 3. Category
        Category category = categoryRepository.save(Category.builder()
                .name("SaaS & Digital Solutions")
                .description("Enterprise software and tools")
                .status(CategoryStatus.ACTIVE)
                .build());
        categoryId = category.getId();

        // 4. Vendor (Pending initially for testing approve/reject)
        Vendor vendor = vendorRepository.save(Vendor.builder()
                .user(vendorUser)
                .businessName("Apex Digital Ltd")
                .category(category)
                .verificationStatus(VendorVerificationStatus.PENDING)
                .vendorStatus(VendorStatus.ACTIVE)
                .build());
        vendorId = vendor.getId();

        // 5. Published Idea
        BusinessIdea idea = businessIdeaRepository.save(BusinessIdea.builder()
                .name("Omnichannel Helpdesk Platform")
                .category(category)
                .shortDescription("Unified ticketing and support system")
                .detailedDescription("Multi-channel customer service tool")
                .investmentRange("$10,000 - $30,000")
                .expectedProfit("40% Margin")
                .requiredSkills("Spring Boot, React, MySQL")
                .riskLevel("LOW")
                .tags("Helpdesk, Support, SaaS")
                .status(BusinessIdeaStatus.PUBLISHED)
                .createdBy(adminUser)
                .build());
        publishedIdeaId = idea.getId();
    }

    // ==========================================
    // 1. ADMIN APIs Tests
    // ==========================================
    @Test
    @DisplayName("Admin Summary API returns non-empty counts")
    void testAdminSummary() throws Exception {
        mockMvc.perform(get("/api/admin/summary")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers", is(3)))
                .andExpect(jsonPath("$.totalVendors", is(1)))
                .andExpect(jsonPath("$.pendingVendors", is(1)))
                .andExpect(jsonPath("$.publishedIdeas", is(1)))
                .andExpect(jsonPath("$.totalCategories", is(1)));
    }

    @Test
    @DisplayName("Admin can view, block and unblock users")
    void testAdminUserBlockUnblock() throws Exception {
        // Get user detail
        mockMvc.perform(get("/api/admin/users/" + userId)
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username", is("jane_user")));

        // Block user
        mockMvc.perform(put("/api/admin/users/" + userId + "/block")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus", is("BLOCKED")));

        // Unblock user
        mockMvc.perform(put("/api/admin/users/" + userId + "/unblock")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus", is("ACTIVE")));
    }

    @Test
    @DisplayName("Admin can create, publish and archive Business Ideas")
    void testAdminIdeaLifecycle() throws Exception {
        BusinessIdeaDto newIdea = BusinessIdeaDto.builder()
                .name("FinTech Micro-Lending Portal")
                .categoryId(categoryId)
                .shortDescription("Micro-lending platform for gig workers")
                .detailedDescription("Automated scoring and payment disbursement engine")
                .investmentRange("$20,000")
                .expectedProfit("25%")
                .status(BusinessIdeaStatus.DRAFT)
                .build();

        // 1. Create Idea
        String response = mockMvc.perform(post("/api/admin/ideas")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newIdea)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("FinTech Micro-Lending Portal")))
                .andExpect(jsonPath("$.status", is("DRAFT")))
                .andReturn().getResponse().getContentAsString();

        BusinessIdeaDto created = objectMapper.readValue(response, BusinessIdeaDto.class);

        // 2. Publish Idea
        mockMvc.perform(put("/api/admin/ideas/" + created.getId() + "/publish")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PUBLISHED")));

        // 3. Archive Idea
        mockMvc.perform(put("/api/admin/ideas/" + created.getId() + "/archive")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ARCHIVED")));
    }

    @Test
    @DisplayName("Admin vendor approval, rejection, suspension lifecycle")
    void testAdminVendorLifecycle() throws Exception {
        // 1. Approve vendor
        mockMvc.perform(put("/api/admin/vendors/" + vendorId + "/approve")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("VERIFIED")))
                .andExpect(jsonPath("$.vendorStatus", is("ACTIVE")));

        // 2. Suspend vendor
        mockMvc.perform(put("/api/admin/vendors/" + vendorId + "/suspend")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vendorStatus", is("SUSPENDED")));

        // 3. Reactivate vendor
        mockMvc.perform(put("/api/admin/vendors/" + vendorId + "/reactivate")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vendorStatus", is("ACTIVE")));

        // 4. Reject vendor with reason
        VendorActionRequest rejectReq = new VendorActionRequest("Tax documents incomplete", null);
        mockMvc.perform(put("/api/admin/vendors/" + vendorId + "/reject")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationStatus", is("REJECTED")))
                .andExpect(jsonPath("$.rejectionReason", is("Tax documents incomplete")));
    }

    @Test
    @DisplayName("Admin Category CRUD with safe deletion prevention")
    void testAdminCategoryCrud() throws Exception {
        // Create Category
        CategoryDto catDto = CategoryDto.builder()
                .name("Hardware & Robotics")
                .description("IoT and robotics manufacturing")
                .status(CategoryStatus.ACTIVE)
                .build();

        String res = mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Hardware & Robotics")))
                .andReturn().getResponse().getContentAsString();

        CategoryDto created = objectMapper.readValue(res, CategoryDto.class);

        // Delete empty category (succeeds)
        mockMvc.perform(delete("/api/admin/categories/" + created.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isNoContent());

        // Deleting category currently in use (categoryId has ideas/vendors) returns 400 Bad Request
        mockMvc.perform(delete("/api/admin/categories/" + categoryId)
                        .header("Authorization", adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Bad Request")));
    }

    // ==========================================
    // 2. USER & PUBLIC APIs Tests
    // ==========================================
    @Test
    @DisplayName("User can get summary, browse ideas, and find vendors by idea")
    void testUserSummaryAndBrowsing() throws Exception {
        // User summary
        mockMvc.perform(get("/api/user/summary")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInquiries", is(0)))
                .andExpect(jsonPath("$.totalApplications", is(0)));

        // Published ideas
        mockMvc.perform(get("/api/ideas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Omnichannel Helpdesk Platform")));

        // Approve vendor so they appear by idea
        mockMvc.perform(put("/api/admin/vendors/" + vendorId + "/approve")
                .header("Authorization", adminToken));

        // Vendors by idea
        mockMvc.perform(get("/api/vendors/by-idea/" + publishedIdeaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].businessName", is("Apex Digital Ltd")));
    }

    // ==========================================
    // 3. INQUIRIES & VENDOR WORKFLOW Tests
    // ==========================================
    @Test
    @DisplayName("Complete Inquiry flow: User creates inquiry, Vendor responds")
    void testInquiryLifecycle() throws Exception {
        // Ensure vendor is verified for inquiry
        Vendor vendor = vendorRepository.findById(vendorId).orElseThrow();
        vendor.setVerificationStatus(VendorVerificationStatus.VERIFIED);
        vendorRepository.save(vendor);

        // 1. User creates inquiry
        CreateInquiryRequest inqReq = new CreateInquiryRequest(vendorId, publishedIdeaId, "Can you deliver this custom helpdesk solution in 4 weeks?");
        String inqRes = mockMvc.perform(post("/api/inquiries")
                        .header("Authorization", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inqReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andExpect(jsonPath("$.message", containsString("4 weeks")))
                .andReturn().getResponse().getContentAsString();

        InquiryDto createdInquiry = objectMapper.readValue(inqRes, InquiryDto.class);

        // 2. User gets their inquiries
        mockMvc.perform(get("/api/inquiries/user")
                        .header("Authorization", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // 3. Vendor gets their incoming inquiries
        mockMvc.perform(get("/api/inquiries/vendor")
                        .header("Authorization", vendorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // 4. Vendor responds to inquiry
        RespondInquiryRequest respondReq = new RespondInquiryRequest(
                createdInquiry.getId(),
                "Yes, we can deliver this in 4 weeks with dedicated support.",
                new BigDecimal("4500.00"),
                "Deployment via AWS or on-premise"
        );

        mockMvc.perform(post("/api/inquiries/respond")
                        .header("Authorization", vendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(respondReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESPONDED")))
                .andExpect(jsonPath("$.quotedPrice", is(4500.00)))
                .andExpect(jsonPath("$.vendorResponse", containsString("Yes, we can deliver")));
    }

    // ==========================================
    // 4. VENDOR SERVICES & JOBS Tests
    // ==========================================
    @Test
    @DisplayName("Vendor Service and Job Opening CRUD")
    void testVendorServiceAndJobs() throws Exception {
        // 1. Create service
        ProductServiceDto serviceDto = ProductServiceDto.builder()
                .name("Enterprise Cloud Migration")
                .categoryId(categoryId)
                .description("Full database and VM migration to cloud")
                .price(new BigDecimal("2999.00"))
                .priceRange("$2500 - $3500")
                .availability("Immediate")
                .build();

        String srvRes = mockMvc.perform(post("/api/vendor/services")
                        .header("Authorization", vendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(serviceDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Enterprise Cloud Migration")))
                .andReturn().getResponse().getContentAsString();

        ProductServiceDto createdSrv = objectMapper.readValue(srvRes, ProductServiceDto.class);

        // 2. Update service
        createdSrv.setPrice(new BigDecimal("3200.00"));
        mockMvc.perform(put("/api/vendor/services/" + createdSrv.getId())
                        .header("Authorization", vendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createdSrv)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price", is(3200.00)));

        // 3. Create job opening
        JobOpeningDto jobDto = JobOpeningDto.builder()
                .title("Senior Cloud Architect")
                .description("Designing scalable cloud infrastructure")
                .requiredSkills("AWS, Kubernetes, Terraform")
                .location("Remote")
                .openings(2)
                .build();

        String jobRes = mockMvc.perform(post("/api/vendor/jobs")
                        .header("Authorization", vendorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jobDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Senior Cloud Architect")))
                .andReturn().getResponse().getContentAsString();

        JobOpeningDto createdJob = objectMapper.readValue(jobRes, JobOpeningDto.class);

        // 4. User applies for job
        mockMvc.perform(post("/api/user/applications?jobOpeningId=" + createdJob.getId() + "&applicationMessage=Applying for cloud architect role")
                        .header("Authorization", userToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("APPLIED")));

        // 5. Vendor views applications for job
        String appRes = mockMvc.perform(get("/api/vendor/jobs/" + createdJob.getId() + "/applications")
                        .header("Authorization", vendorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andReturn().getResponse().getContentAsString();

        List<JobApplicationDto> apps = objectMapper.readValue(appRes, objectMapper.getTypeFactory().constructCollectionType(List.class, JobApplicationDto.class));

        // 6. Vendor accepts application
        mockMvc.perform(put("/api/vendor/applications/" + apps.get(0).getId() + "/accept")
                        .header("Authorization", vendorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ACCEPTED")));
    }
}
