package com.bizconnect.config;

import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.*;
import com.bizconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private BusinessIdeaRepository businessIdeaRepository;

    @Autowired
    private ProductServiceRepository productServiceRepository;

    @Autowired
    private JobOpeningRepository jobOpeningRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already exists
        }

        // 1. Create Default Admin
        User admin = userRepository.save(User.builder()
                .username("admin")
                .email("admin@bizconnect.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        // 2. Create Default Categories
        Category catSolar = categoryRepository.save(Category.builder()
                .name("Renewable Energy & Cleantech")
                .description("Solar installations, grid storage, and commercial clean energy systems.")
                .status(CategoryStatus.ACTIVE)
                .build());

        Category catFood = categoryRepository.save(Category.builder()
                .name("Food & Beverage Franchise")
                .description("Turnkey franchise models, cloud kitchens, and gourmet food retail.")
                .status(CategoryStatus.ACTIVE)
                .build());

        Category catTech = categoryRepository.save(Category.builder()
                .name("IT & Cloud Infrastructure")
                .description("Managed hosting, SaaS development, and DevOps automation services.")
                .status(CategoryStatus.ACTIVE)
                .build());

        Category catHealth = categoryRepository.save(Category.builder()
                .name("Healthcare & Medical Logistics")
                .description("Diagnostic supply chains, medical clinic equipment, and pharma supply.")
                .status(CategoryStatus.ACTIVE)
                .build());

        // 3. Create Sample Verified Vendor
        User vendorUser = userRepository.save(User.builder()
                .username("sunpower_vendor")
                .email("contact@sunpowersystems.com")
                .password(passwordEncoder.encode("Vendor@123"))
                .role(Role.VENDOR)
                .accountStatus(AccountStatus.ACTIVE)
                .build());

        Vendor vendor = vendorRepository.save(Vendor.builder()
                .user(vendorUser)
                .businessName("SunPower Systems Ltd")
                .ownerName("Alexander Wright")
                .email("contact@sunpowersystems.com")
                .phone("+1-555-0188")
                .address("700 Clean Energy Blvd, Austin, TX 78701")
                .description("Tier-1 solar microgrid equipment manufacturer and EPC contracting partner.")
                .category(catSolar)
                .verificationStatus(VendorVerificationStatus.VERIFIED)
                .vendorStatus(VendorStatus.ACTIVE)
                .verifiedAt(java.time.LocalDateTime.now())
                .build());

        // Add Product Offering for Vendor
        productServiceRepository.save(ProductService.builder()
                .vendor(vendor)
                .name("50kW Commercial Solar Inverters & Battery Storage")
                .category(catSolar)
                .description("High-efficiency modular commercial inverters with 10-year warranty and remote telemetry.")
                .price(new BigDecimal("18500.00"))
                .priceRange("$18,000 - $22,000")
                .availability("In Stock / 2 Weeks Deployment")
                .status(ProductServiceStatus.APPROVED)
                .build());

        // Add Job Opening for Vendor
        jobOpeningRepository.save(JobOpening.builder()
                .vendor(vendor)
                .title("Senior Clean Energy Systems Engineer")
                .description("Lead on-site design, commissioning, and grid synchronization for industrial solar installations.")
                .requiredSkills("Solar PV, Electrical Engineering, Inverter Synchronization, NABCEP")
                .location("Austin, TX (Hybrid)")
                .openings(2)
                .status(JobOpeningStatus.OPEN)
                .closingDate(LocalDate.now().plusMonths(2))
                .build());

        // 4. Create Sample Published Business Idea
        businessIdeaRepository.save(BusinessIdea.builder()
                .name("Commercial Solar Microgrid Setup")
                .category(catSolar)
                .shortDescription("Turnkey solar energy generation and peak-shaving storage for commercial properties.")
                .detailedDescription("Develop decentralized solar microgrid installations for commercial warehouses and retail plazas. Generates recurring revenue via long-term power purchase agreements (PPAs) and energy arbitrage during peak grid hours.")
                .investmentRange("$50,000 - $120,000")
                .expectedProfit("25% - 35% Annual ROI")
                .riskLevel("Medium")
                .requiredSkills("Project Management, Electrical Permitting, B2B Commercial Sales")
                .tags("Cleantech, Renewable Energy, B2B, Microgrid, ESG")
                .status(BusinessIdeaStatus.PUBLISHED)
                .createdBy(admin)
                .build());

        businessIdeaRepository.save(BusinessIdea.builder()
                .name("Specialty Gourmet Coffee Pod Delivery")
                .category(catFood)
                .shortDescription("Subscription-based roasted artisan coffee pod service for corporate offices.")
                .detailedDescription("B2B subscription model supplying freshly roasted biodegradable espresso pods and automated bean-to-cup machines for modern office spaces. Consistent recurring monthly revenue with high retention rates.")
                .investmentRange("$15,000 - $35,000")
                .expectedProfit("40% Gross Margin")
                .riskLevel("Low")
                .requiredSkills("Food Sourcing, Subscription Operations, Client Relations")
                .tags("F&B, Subscription, Corporate Services, Coffee, Low Risk")
                .status(BusinessIdeaStatus.PUBLISHED)
                .createdBy(admin)
                .build());

        // 5. Create Sample Entrepreneur User
        User entrepreneur = userRepository.save(User.builder()
                .username("john_entrepreneur")
                .email("john@entrepreneur.com")
                .password(passwordEncoder.encode("User@123"))
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build());
    }
}
