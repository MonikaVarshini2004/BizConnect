package com.bizconnect.controller;

import com.bizconnect.dto.CreateInquiryRequest;
import com.bizconnect.dto.InquiryDto;
import com.bizconnect.dto.RespondInquiryRequest;
import com.bizconnect.entity.Inquiry;
import com.bizconnect.entity.User;
import com.bizconnect.entity.enums.Role;
import com.bizconnect.exception.ResourceNotFoundException;
import com.bizconnect.repository.InquiryRepository;
import com.bizconnect.repository.UserRepository;
import com.bizconnect.repository.VendorRepository;
import com.bizconnect.security.services.UserDetailsImpl;
import com.bizconnect.service.UserService;
import com.bizconnect.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InquiryDto> createInquiry(
            @Valid @RequestBody CreateInquiryRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        InquiryDto dto = InquiryDto.builder()
                .vendorId(request.getVendorId())
                .businessIdeaId(request.getBusinessIdeaId())
                .message(request.getMessage())
                .build();
        InquiryDto created = userService.createInquiry(dto, userDetails.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<InquiryDto>> getUserInquiries(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getOwnInquiries(userDetails.getId()));
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<InquiryDto>> getVendorInquiries(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getOwnInquiries(userDetails.getId()));
    }

    @PostMapping("/respond")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<InquiryDto> respondToInquiry(
            @Valid @RequestBody RespondInquiryRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.respondToInquiry(request, userDetails.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<InquiryDto> getInquiryById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Inquiry inquiry = inquiryRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + id));

        User currentUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Allow Admin
        if (currentUser.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(InquiryDto.fromEntity(inquiry));
        }

        // Allow User if owner
        if (currentUser.getRole() == Role.USER) {
            if (inquiry.getUser() != null && inquiry.getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.ok(InquiryDto.fromEntity(inquiry));
            } else {
                throw new AccessDeniedException("Access denied: You do not own this inquiry");
            }
        }

        // Allow Vendor if inquiry is directed to them
        if (currentUser.getRole() == Role.VENDOR) {
            if (inquiry.getVendor() != null && inquiry.getVendor().getUser() != null &&
                    inquiry.getVendor().getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.ok(InquiryDto.fromEntity(inquiry));
            } else {
                throw new AccessDeniedException("Access denied: This inquiry is not addressed to your business");
            }
        }

        throw new AccessDeniedException("Access denied");
    }
}
