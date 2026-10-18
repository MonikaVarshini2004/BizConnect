package com.bizconnect.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${bizconnect.jwt.secret:}")
    private String jwtSecret;

    @Value("${bizconnect.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    public void validateAndInitializeKey() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException(
                "JWT configuration error: 'JWT_SECRET' environment variable is missing or empty. " +
                "A cryptographically secure Base64-encoded key of at least 256 bits (32 bytes) must be provided."
            );
        }

        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret.trim());
            if (keyBytes.length < 32) {
                throw new IllegalStateException(
                    "JWT configuration error: Decoded 'JWT_SECRET' length is " + (keyBytes.length * 8) +
                    " bits (" + keyBytes.length + " bytes). HMAC-SHA signing requires a minimum of 256 bits (32 bytes)."
                );
            }
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        } catch (io.jsonwebtoken.io.DecodingException | IllegalArgumentException e) {
            throw new IllegalStateException(
                "JWT configuration error: 'JWT_SECRET' must be a valid Base64-encoded string: " + e.getMessage(), e
            );
        }
    }

    private SecretKey getSigningKey() {
        if (this.signingKey == null) {
            validateAndInitializeKey();
        }
        return this.signingKey;
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateTokenFromUsernameAndRoles(String username, List<String> roles) {
        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
