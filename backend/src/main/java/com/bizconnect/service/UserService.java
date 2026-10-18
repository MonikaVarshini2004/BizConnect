package com.bizconnect.service;

import com.bizconnect.dto.InquiryDto;
import com.bizconnect.dto.JobApplicationDto;
import com.bizconnect.dto.UserResponseDto;
import com.bizconnect.entity.*;
import com.bizconnect.entity.enums.InquiryStatus;
import com.bizconnect.entity.enums.JobApplicationStatus;
import com.bizconnect.exception.BadRequestException;
import com.bizconnect.exception.ResourceNotFoundException;
import com.bizconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private BusinessIdeaRepository businessIdeaRepository;

    @Autowired
    private JobOpeningRepository jobOpeningRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Transactional(readOnly = true)
    public UserResponseDto getOwnProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return UserResponseDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUserSummary(Long userId) {
        List<Inquiry> userInquiries = inquiryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        long totalInquiries = userInquiries.size();
        long pendingInquiries = userInquiries.stream().filter(i -> i.getStatus() == InquiryStatus.PENDING).count();
        long respondedInquiries = userInquiries.stream().filter(i -> i.getStatus() == InquiryStatus.RESPONDED).count();
        long totalApplications = jobApplicationRepository.findByUserId(userId).size();

        long availableIdeas = businessIdeaRepository.countByStatus(com.bizconnect.entity.enums.BusinessIdeaStatus.PUBLISHED);
        long verifiedVendors = vendorRepository.countByVerificationStatusAndVendorStatus(
                com.bizconnect.entity.enums.VendorVerificationStatus.VERIFIED,
                com.bizconnect.entity.enums.VendorStatus.ACTIVE
        );

        Map<String, Object> summary = new HashMap<>();
        summary.put("availableIdeas", availableIdeas);
        summary.put("verifiedVendors", verifiedVendors);
        summary.put("myInquiries", totalInquiries);
        summary.put("pendingResponses", pendingInquiries);
        summary.put("totalInquiries", totalInquiries);
        summary.put("pendingInquiries", pendingInquiries);
        summary.put("respondedInquiries", respondedInquiries);
        summary.put("totalApplications", totalApplications);
        return summary;
    }

    @Transactional
    public UserResponseDto updateOwnProfile(Long userId, UserResponseDto updateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (updateDto.getEmail() != null && !updateDto.getEmail().trim().isEmpty()) {
            user.setEmail(updateDto.getEmail().trim());
        }
        User updated = userRepository.save(user);
        return UserResponseDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<InquiryDto> getOwnInquiries(Long userId) {
        return inquiryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(InquiryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InquiryDto getOwnInquiryById(Long inquiryId, Long userId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + inquiryId));

        // Critical ownership check: User can only access their OWN inquiry
        if (!inquiry.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You do not own this inquiry");
        }

        return InquiryDto.fromEntity(inquiry);
    }

    @Transactional
    public InquiryDto createInquiry(InquiryDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (dto.getVendorId() == null) {
            throw new BadRequestException("Target vendorId is required");
        }

        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + dto.getVendorId()));

        if (vendor.getVerificationStatus() != com.bizconnect.entity.enums.VendorVerificationStatus.VERIFIED ||
                vendor.getVendorStatus() != com.bizconnect.entity.enums.VendorStatus.ACTIVE) {
            throw new BadRequestException("Cannot send inquiry to an unverified or inactive vendor");
        }

        BusinessIdea idea = null;
        if (dto.getBusinessIdeaId() != null) {
            idea = businessIdeaRepository.findById(dto.getBusinessIdeaId()).orElse(null);
        }

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .vendor(vendor)
                .businessIdea(idea)
                .message(dto.getMessage())
                .status(InquiryStatus.PENDING)
                .build();

        Inquiry saved = inquiryRepository.save(inquiry);
        return InquiryDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationDto> getOwnJobApplications(Long userId) {
        return jobApplicationRepository.findByUserId(userId).stream()
                .map(JobApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobApplicationDto applyForJob(Long jobOpeningId, String applicationMessage, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        JobOpening jobOpening = jobOpeningRepository.findById(jobOpeningId)
                .orElseThrow(() -> new ResourceNotFoundException("Job opening not found with id: " + jobOpeningId));

        if (jobApplicationRepository.findByJobOpeningIdAndUserId(jobOpeningId, userId).isPresent()) {
            throw new BadRequestException("You have already applied for this job opening");
        }

        JobApplication app = JobApplication.builder()
                .jobOpening(jobOpening)
                .user(user)
                .applicationMessage(applicationMessage)
                .status(JobApplicationStatus.APPLIED)
                .build();

        JobApplication saved = jobApplicationRepository.save(app);
        return JobApplicationDto.fromEntity(saved);
    }
}
