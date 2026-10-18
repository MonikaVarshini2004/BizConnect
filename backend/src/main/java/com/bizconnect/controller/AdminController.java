package com.bizconnect.controller;

import com.bizconnect.dto.*;
import com.bizconnect.security.services.UserDetailsImpl;
import com.bizconnect.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.bizconnect.entity.enums.CategoryStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ==========================================
    // SUMMARY & DASHBOARD STATS
    // ==========================================
    @GetMapping({"/summary", "/dashboard"})
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==========================================
    // USERS
    // ==========================================
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailAdminDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<UserResponseDto> blockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.blockUser(id, adminDetails.getId()));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<UserResponseDto> unblockUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.unblockUser(id, adminDetails.getId()));
    }

    // ==========================================
    // BUSINESS IDEAS
    // ==========================================
    @GetMapping("/ideas")
    public ResponseEntity<List<BusinessIdeaDto>> getAllIdeas() {
        return ResponseEntity.ok(adminService.getAllIdeas());
    }

    @GetMapping("/ideas/{id}")
    public ResponseEntity<BusinessIdeaDto> getIdeaById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getIdeaById(id));
    }

    @PostMapping("/ideas")
    public ResponseEntity<BusinessIdeaDto> createIdea(
            @Valid @RequestBody BusinessIdeaDto dto,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        BusinessIdeaDto created = adminService.createIdea(dto, adminDetails.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/ideas/{id}")
    public ResponseEntity<BusinessIdeaDto> updateIdea(
            @PathVariable Long id,
            @RequestBody BusinessIdeaDto dto,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.updateIdea(id, dto, adminDetails.getId()));
    }

    @PutMapping("/ideas/{id}/publish")
    public ResponseEntity<BusinessIdeaDto> publishIdea(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.publishIdea(id, adminDetails.getId()));
    }

    @PutMapping("/ideas/{id}/archive")
    public ResponseEntity<BusinessIdeaDto> archiveIdea(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.archiveIdea(id, adminDetails.getId()));
    }

    // ==========================================
    // VENDORS
    // ==========================================
    @GetMapping("/vendors")
    public ResponseEntity<List<VendorDto>> getVerifiedVendors() {
        return ResponseEntity.ok(adminService.getVerifiedVendors());
    }

    @GetMapping("/vendors/pending")
    public ResponseEntity<List<VendorDto>> getPendingVendors() {
        return ResponseEntity.ok(adminService.getPendingVendors());
    }

    @GetMapping("/vendors/{id}")
    public ResponseEntity<VendorDetailAdminDto> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getVendorDetail(id));
    }

    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<VendorDto> approveVendor(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.approveVendor(id, adminDetails.getId()));
    }

    @PutMapping("/vendors/{id}/reject")
    public ResponseEntity<VendorDto> rejectVendor(
            @PathVariable Long id,
            @RequestBody(required = false) VendorActionRequest request,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        String reason = (request != null && request.getReason() != null) ? request.getReason() : "Application rejected by administrator";
        return ResponseEntity.ok(adminService.rejectVendor(id, reason, adminDetails.getId()));
    }

    @PutMapping("/vendors/{id}/request-changes")
    public ResponseEntity<VendorDto> requestVendorChanges(
            @PathVariable Long id,
            @RequestBody(required = false) VendorActionRequest request,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        String message = (request != null && request.getMessage() != null) ? request.getMessage() : "Please update your profile details";
        return ResponseEntity.ok(adminService.requestVendorChanges(id, message, adminDetails.getId()));
    }

    @PutMapping("/vendors/{id}/suspend")
    public ResponseEntity<VendorDto> suspendVendor(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.suspendVendor(id, adminDetails.getId()));
    }

    @PutMapping("/vendors/{id}/reactivate")
    public ResponseEntity<VendorDto> reactivateVendor(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.reactivateVendor(id, adminDetails.getId()));
    }

    // ==========================================
    // CATEGORIES
    // ==========================================
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryWithStatsDto>> getCategories() {
        return ResponseEntity.ok(adminService.getCategoriesWithStats());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(
            @Valid @RequestBody CategoryDto dto,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        CategoryDto created = adminService.createCategory(dto, adminDetails.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryDto dto,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return ResponseEntity.ok(adminService.updateCategory(id, dto, adminDetails.getId()));
    }

@PutMapping("/categories/{id}/status")
public ResponseEntity<CategoryDto> updateCategoryStatus(
        @PathVariable Long id,
        @RequestParam CategoryStatus status,
        @AuthenticationPrincipal UserDetailsImpl adminDetails) {

    CategoryDto updated = adminService.updateCategoryStatus(
            id,
            status,
            adminDetails.getId()
    );

    return ResponseEntity.ok(updated);
}
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        adminService.deleteCategory(id, adminDetails.getId());
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // INQUIRIES & AUDIT LOGS
    // ==========================================
    @GetMapping("/inquiries")
    public ResponseEntity<List<InquiryDto>> getAllInquiries() {
        return ResponseEntity.ok(adminService.getAllInquiries());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AdminAuditLogDto>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }
}
