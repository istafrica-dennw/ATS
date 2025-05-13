package com.ats.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
import io.jsonwebtoken.SignatureAlgorithm;
import java.nio.charset.StandardCharsets;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;
    
    // Use the correct algorithm to match the tokens - HmacSHA384
    private Key getSigningKey() {
        // Create the key from the configured secret using HmacSHA384
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        String username;
        String roles;
        
        Object principal = authentication.getPrincipal();
        
        // Handle different principal types
        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            username = userDetails.getUsername();
            roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
        } else if (principal instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) principal;
            username = oidcUser.getEmail();
            roles = oidcUser.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
        } else {
            // Fallback for other principal types
            username = principal.toString();
            roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
        }
        
        return generateTokenForUsernameAndRoles(username, roles);
    }
    
    // Method to generate token with consistent format for any auth method
    public String generateTokenForUsernameAndRoles(String username, String roles) {
        System.out.println("[DEBUG] Generating token for username: " + username + " with roles: " + roles);
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS384) // Explicitly use HS384 to match the tokens
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            System.out.println("[DEBUG] Validating token starting with: " + token.substring(0, Math.min(20, token.length())));
            
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            
            System.out.println("[DEBUG] Token validation successful");
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("[ERROR] Invalid JWT token: " + e.getMessage());
            return false;
        }
    }
} 