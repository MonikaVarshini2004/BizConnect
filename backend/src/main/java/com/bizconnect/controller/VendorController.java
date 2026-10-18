package com.bizconnect.controller;

import com.bizconnect.dto.*;
import com.bizconnect.security.services.UserDetailsImpl;
import com.bizconnect.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor")
@PreAuthorize("hasRole('VENDOR')")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    // ==========================================
    // PROFILE & SUMMARY
    // ==========================================
    @GetMapping("/summary")
    public ResponseEntity<java.util.Map<String, Object>> getSummary(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getVendorSummary(userDetails.getId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<VendorDto> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getOwnProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<VendorDto> updateProfile(
            @RequestBody VendorDto updateDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.updateOwnProfile(userDetails.getId(), updateDto));
    }

    // ==========================================
    // SERVICES
    // ==========================================
    @GetMapping("/services")
    public ResponseEntity<List<ProductServiceDto>> getOwnServices(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getOwnServices(userDetails.getId()));
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ProductServiceDto> getOwnService(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getOwnServiceById(id, userDetails.getId()));
    }

    @PostMapping("/services")
    public ResponseEntity<ProductServiceDto> createService(
            @Valid @RequestBody ProductServiceDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        ProductServiceDto created = vendorService.createService(dto, userDetails.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ProductServiceDto> updateService(
            @PathVariable Long id,
            @RequestBody ProductServiceDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.updateService(id, dto, userDetails.getId()));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        vendorService.deleteService(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // JOBS & APPLICATIONS
    // ==========================================
    @GetMapping("/jobs")
    public ResponseEntity<List<JobOpeningDto>> getOwnJobs(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getOwnJobs(userDetails.getId()));
    }

    @PostMapping("/jobs")
    public ResponseEntity<JobOpeningDto> createJob(
            @Valid @RequestBody JobOpeningDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        JobOpeningDto created = vendorService.createJobOpening(dto, userDetails.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<JobOpeningDto> updateJob(
            @PathVariable Long id,
            @RequestBody JobOpeningDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.updateJobOpening(id, dto, userDetails.getId()));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        vendorService.deleteJobOpening(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jobs/{id}/applications")
    public ResponseEntity<List<JobApplicationDto>> getApplicationsForJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getApplicationsForJob(id, userDetails.getId()));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplicationDto>> getAllApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.getAllApplications(userDetails.getId()));
    }

    @PutMapping("/applications/{id}/shortlist")
    public ResponseEntity<JobApplicationDto> shortlistApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.shortlistApplication(id, userDetails.getId()));
    }

    @PutMapping("/applications/{id}/accept")
    public ResponseEntity<JobApplicationDto> acceptApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.acceptApplication(id, userDetails.getId()));
    }

    @PutMapping("/applications/{id}/reject")
    public ResponseEntity<JobApplicationDto> rejectApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(vendorService.rejectApplication(id, userDetails.getId()));
    }
}
