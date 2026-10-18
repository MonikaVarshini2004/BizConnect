package com.bizconnect.security.services;

import com.bizconnect.dto.UserResponseDto;
import com.bizconnect.entity.Category;
import com.bizconnect.entity.User;
import com.bizconnect.entity.Vendor;
import com.bizconnect.entity.enums.AccountStatus;
import com.bizconnect.entity.enums.Role;
import com.bizconnect.entity.enums.VendorStatus;
import com.bizconnect.entity.enums.VendorVerificationStatus;
import com.bizconnect.exception.BadRequestException;
import com.bizconnect.repository.CategoryRepository;
import com.bizconnect.repository.UserRepository;
import com.bizconnect.repository.VendorRepository;
import com.bizconnect.security.dto.JwtResponse;
import com.bizconnect.security.dto.LoginRequest;
import com.bizconnect.security.dto.RegisterRequest;
import com.bizconnect.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Update last login timestamp
        userRepository.findById(userDetails.getId()).ifPresent(user -> {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        });

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus())
                .build();
    }

    @Transactional
    public UserResponseDto registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Prevent public self-registration as ADMIN
        Role requestedRole = registerRequest.getRole();
        if (requestedRole == Role.ADMIN) {
            throw new BadRequestException("Admin registration is not permitted via public registration endpoint");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(requestedRole)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        // If user is registering as VENDOR, automatically create corresponding Vendor profile
        if (requestedRole == Role.VENDOR) {
            Category category = null;
            if (registerRequest.getCategoryId() != null) {
                category = categoryRepository.findById(registerRequest.getCategoryId()).orElse(null);
            }

            Vendor vendor = Vendor.builder()
                    .user(savedUser)
                    .businessName(registerRequest.getBusinessName() != null ? registerRequest.getBusinessName() : savedUser.getUsername() + " Business")
                    .ownerName(registerRequest.getOwnerName() != null ? registerRequest.getOwnerName() : savedUser.getUsername())
                    .email(savedUser.getEmail())
                    .phone(registerRequest.getPhone())
                    .address(registerRequest.getAddress())
                    .description(registerRequest.getDescription())
                    .category(category)
                    .verificationStatus(VendorVerificationStatus.PENDING)
                    .vendorStatus(VendorStatus.ACTIVE)
                    .build();

            vendorRepository.save(vendor);
        }

        return UserResponseDto.fromEntity(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDto getCurrentUserProfile(UserDetailsImpl userDetails) {
        if (userDetails == null) {
            throw new BadRequestException("Not authenticated");
        }
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return UserResponseDto.fromEntity(user);
    }
}
