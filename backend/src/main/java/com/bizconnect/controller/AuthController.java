package com.bizconnect.controller;

import com.bizconnect.dto.UserResponseDto;
import com.bizconnect.security.dto.JwtResponse;
import com.bizconnect.security.dto.LoginRequest;
import com.bizconnect.security.dto.RegisterRequest;
import com.bizconnect.security.services.AuthService;
import com.bizconnect.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody RegisterRequest registerRequest) {
        UserResponseDto response = authService.registerUser(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserResponseDto user = authService.getCurrentUserProfile(userDetails);
        return ResponseEntity.ok(user);
    }
}
