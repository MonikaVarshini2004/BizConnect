package com.bizconnect.controller;

import com.bizconnect.dto.InquiryDto;
import com.bizconnect.dto.JobApplicationDto;
import com.bizconnect.dto.UserResponseDto;
import com.bizconnect.security.services.UserDetailsImpl;
import com.bizconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDto> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getOwnProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponseDto> updateProfile(
            @RequestBody UserResponseDto updateDto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.updateOwnProfile(userDetails.getId(), updateDto));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getUserSummary(userDetails.getId()));
    }

    @GetMapping("/inquiries")
    public ResponseEntity<List<InquiryDto>> getOwnInquiries(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getOwnInquiries(userDetails.getId()));
    }

    @GetMapping("/inquiries/{id}")
    public ResponseEntity<InquiryDto> getOwnInquiry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getOwnInquiryById(id, userDetails.getId()));
    }

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplicationDto>> getOwnApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getOwnJobApplications(userDetails.getId()));
    }

    @PostMapping("/applications")
    public ResponseEntity<JobApplicationDto> applyForJob(
            @RequestParam(required = false) Long jobOpeningId,
            @RequestParam(required = false) String applicationMessage,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long targetJobId = jobOpeningId;
        String message = applicationMessage;
        if (targetJobId == null && body != null && body.get("jobOpeningId") != null) {
            targetJobId = Long.valueOf(body.get("jobOpeningId").toString());
        }
        if (message == null && body != null && body.get("applicationMessage") != null) {
            message = body.get("applicationMessage").toString();
        }
        if (targetJobId == null) {
            throw new com.bizconnect.exception.BadRequestException("jobOpeningId is required");
        }
        JobApplicationDto created = userService.applyForJob(targetJobId, message, userDetails.getId());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
