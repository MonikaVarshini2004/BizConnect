package com.bizconnect.service;

import com.bizconnect.dto.*;
import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.InquiryStatus;
import com.bizconnect.entity.enums.JobApplicationStatus;
import com.bizconnect.entity.enums.ProductServiceStatus;
import com.bizconnect.exception.BadRequestException;
import com.bizconnect.exception.ResourceNotFoundException;
import com.bizconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorService {

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
    private CategoryRepository categoryRepository;

    // ==========================================
    // PROFILE & SUMMARY
    // ==========================================
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getVendorSummary(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for authenticated user"));

        List<ProductService> services = productServiceRepository.findByVendorId(vendor.getId());
        long totalServices = services.size();
        long activeServices = services.stream().filter(s -> s.getStatus() == ProductServiceStatus.APPROVED).count();
        long pendingServices = services.stream().filter(s -> s.getStatus() == ProductServiceStatus.PENDING).count();

        List<Inquiry> inquiries = inquiryRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());
        long totalInquiries = inquiries.size();
        long pendingInquiries = inquiries.stream().filter(i -> i.getStatus() == InquiryStatus.PENDING).count();
        long respondedInquiries = inquiries.stream().filter(i -> i.getStatus() == InquiryStatus.RESPONDED).count();

        List<JobOpening> jobs = jobOpeningRepository.findByVendorId(vendor.getId());
        long totalJobs = jobs.size();
        long openJobs = jobs.stream().filter(j -> j.getStatus() == com.bizconnect.entity.enums.JobOpeningStatus.OPEN).count();

        List<JobApplication> applications = jobApplicationRepository.findByJobOpeningVendorIdOrderByAppliedAtDesc(vendor.getId());
        long totalApplications = applications.size();
        long pendingApplications = applications.stream().filter(a -> a.getStatus() == JobApplicationStatus.APPLIED).count();
        long shortlistedApplications = applications.stream().filter(a -> a.getStatus() == JobApplicationStatus.SHORTLISTED).count();
        long acceptedApplications = applications.stream().filter(a -> a.getStatus() == JobApplicationStatus.ACCEPTED).count();
        long rejectedApplications = applications.stream().filter(a -> a.getStatus() == JobApplicationStatus.REJECTED).count();

        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("businessName", vendor.getBusinessName());
        summary.put("ownerName", vendor.getOwnerName());
        summary.put("verificationStatus", vendor.getVerificationStatus());
        summary.put("vendorStatus", vendor.getVendorStatus());
        summary.put("rejectionReason", vendor.getRejectionReason());
        summary.put("categoryName", vendor.getCategory() != null ? vendor.getCategory().getName() : null);

        summary.put("totalServices", totalServices);
        summary.put("activeServices", activeServices);
        summary.put("pendingServices", pendingServices);
        summary.put("servicesCount", totalServices);

        summary.put("totalInquiries", totalInquiries);
        summary.put("pendingInquiries", pendingInquiries);
        summary.put("respondedInquiries", respondedInquiries);

        summary.put("totalJobs", totalJobs);
        summary.put("openJobs", openJobs);

        summary.put("totalApplications", totalApplications);
        summary.put("pendingApplications", pendingApplications);
        summary.put("shortlistedApplications", shortlistedApplications);
        summary.put("acceptedApplications", acceptedApplications);
        summary.put("rejectedApplications", rejectedApplications);

        return summary;
    }

    @Transactional(readOnly = true)
    public VendorDto getOwnProfile(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for authenticated user"));
        return VendorDto.fromEntity(vendor);
    }

    @Transactional
    public VendorDto updateOwnProfile(Long userId, VendorDto updateDto) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for authenticated user"));

        if (updateDto.getBusinessName() != null && !updateDto.getBusinessName().isBlank()) {
            vendor.setBusinessName(updateDto.getBusinessName());
        }
        if (updateDto.getOwnerName() != null) {
            vendor.setOwnerName(updateDto.getOwnerName());
        }
        if (updateDto.getPhone() != null) {
            vendor.setPhone(updateDto.getPhone());
        }
        if (updateDto.getAddress() != null) {
            vendor.setAddress(updateDto.getAddress());
        }
        if (updateDto.getDescription() != null) {
            vendor.setDescription(updateDto.getDescription());
        }
        if (updateDto.getCategoryId() != null) {
            categoryRepository.findById(updateDto.getCategoryId()).ifPresent(vendor::setCategory);
        }

        Vendor updated = vendorRepository.save(vendor);
        return VendorDto.fromEntity(updated);
    }

    // ==========================================
    // SERVICES
    // ==========================================
    @Transactional(readOnly = true)
    public List<ProductServiceDto> getOwnServices(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));
        return productServiceRepository.findByVendorId(vendor.getId()).stream()
                .map(ProductServiceDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductServiceDto getOwnServiceById(Long serviceId, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        ProductService service = productServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this service listing");
        }

        return ProductServiceDto.fromEntity(service);
    }

    @Transactional
    public ProductServiceDto createService(ProductServiceDto dto, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        }

        ProductService item = ProductService.builder()
                .vendor(vendor)
                .name(dto.getName())
                .category(category)
                .description(dto.getDescription())
                .price(dto.getPrice())
                .priceRange(dto.getPriceRange())
                .availability(dto.getAvailability())
                .status(ProductServiceStatus.PENDING)
                .build();

        ProductService saved = productServiceRepository.save(item);
        return ProductServiceDto.fromEntity(saved);
    }

    @Transactional
    public ProductServiceDto updateService(Long serviceId, ProductServiceDto dto, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        ProductService item = productServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        if (!item.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this service listing");
        }

        if (dto.getName() != null) item.setName(dto.getName());
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        if (dto.getPrice() != null) item.setPrice(dto.getPrice());
        if (dto.getPriceRange() != null) item.setPriceRange(dto.getPriceRange());
        if (dto.getAvailability() != null) item.setAvailability(dto.getAvailability());
        if (dto.getStatus() != null) item.setStatus(dto.getStatus());
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(item::setCategory);
        }

        ProductService updated = productServiceRepository.save(item);
        return ProductServiceDto.fromEntity(updated);
    }

    @Transactional
    public void deleteService(Long serviceId, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        ProductService item = productServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));

        if (!item.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this service listing");
        }

        productServiceRepository.delete(item);
    }

    // ==========================================
    // INQUIRIES
    // ==========================================
    @Transactional(readOnly = true)
    public List<InquiryDto> getOwnInquiries(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        return inquiryRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId()).stream()
                .map(InquiryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public InquiryDto respondToInquiry(RespondInquiryRequest request, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        Inquiry inquiry = inquiryRepository.findById(request.getInquiryId())
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + request.getInquiryId()));

        if (!inquiry.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: This inquiry is not directed to your vendor account");
        }

        if (request.getVendorResponse() == null || request.getVendorResponse().isBlank()) {
            throw new BadRequestException("Vendor response message is required");
        }

        inquiry.setVendorResponse(request.getVendorResponse());
        if (request.getQuotedPrice() != null) {
            inquiry.setQuotedPrice(request.getQuotedPrice());
        }
        if (request.getDeliveryInformation() != null) {
            inquiry.setDeliveryInformation(request.getDeliveryInformation());
        }
        inquiry.setStatus(InquiryStatus.RESPONDED);
        inquiry.setRespondedAt(LocalDateTime.now());

        Inquiry updated = inquiryRepository.save(inquiry);
        return InquiryDto.fromEntity(updated);
    }

    // ==========================================
    // JOBS & APPLICATIONS
    // ==========================================
    @Transactional(readOnly = true)
    public List<JobOpeningDto> getOwnJobs(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        return jobOpeningRepository.findByVendorId(vendor.getId()).stream()
                .map(JobOpeningDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobOpeningDto createJobOpening(JobOpeningDto dto, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        JobOpening job = JobOpening.builder()
                .vendor(vendor)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .requiredSkills(dto.getRequiredSkills())
                .location(dto.getLocation())
                .openings(dto.getOpenings() != null ? dto.getOpenings() : 1)
                .status(dto.getStatus() != null ? dto.getStatus() : com.bizconnect.entity.enums.JobOpeningStatus.OPEN)
                .closingDate(dto.getClosingDate())
                .build();

        JobOpening saved = jobOpeningRepository.save(job);
        return JobOpeningDto.fromEntity(saved);
    }

    @Transactional
    public JobOpeningDto updateJobOpening(Long jobId, JobOpeningDto dto, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        JobOpening job = jobOpeningRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening not found with id: " + jobId));

        if (!job.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job opening");
        }

        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getRequiredSkills() != null) job.setRequiredSkills(dto.getRequiredSkills());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getOpenings() != null) job.setOpenings(dto.getOpenings());
        if (dto.getStatus() != null) job.setStatus(dto.getStatus());
        if (dto.getClosingDate() != null) job.setClosingDate(dto.getClosingDate());

        JobOpening updated = jobOpeningRepository.save(job);
        return JobOpeningDto.fromEntity(updated);
    }

    @Transactional
    public void deleteJobOpening(Long jobId, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        JobOpening job = jobOpeningRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening not found with id: " + jobId));

        if (!job.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job opening");
        }

        jobOpeningRepository.delete(job);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getApplicationsForJob(Long jobId, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        JobOpening job = jobOpeningRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening not found with id: " + jobId));

        if (!job.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job opening");
        }

        return jobApplicationRepository.findByJobOpeningId(jobId).stream()
                .map(JobApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationDto acceptApplication(Long applicationId, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        if (!app.getJobOpening().getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job opening");
        }

        app.setStatus(JobApplicationStatus.ACCEPTED);
        JobApplication updated = jobApplicationRepository.save(app);
        return JobApplicationDto.fromEntity(updated);
    }

    @Transactional
    public JobApplicationDto rejectApplication(Long applicationId, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        if (!app.getJobOpening().getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job opening");
        }

        app.setStatus(JobApplicationStatus.REJECTED);
        JobApplication updated = jobApplicationRepository.save(app);
        return JobApplicationDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getAllApplications(Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        return jobApplicationRepository.findByJobOpeningVendorIdOrderByAppliedAtDesc(vendor.getId()).stream()
                .map(JobApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationDto shortlistApplication(Long applicationId, Long userId) {
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found"));

        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found with id: " + applicationId));

        if (!app.getJobOpening().getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this job opening");
        }

        app.setStatus(JobApplicationStatus.SHORTLISTED);
        JobApplication updated = jobApplicationRepository.save(app);
        return JobApplicationDto.fromEntity(updated);
    }
}
