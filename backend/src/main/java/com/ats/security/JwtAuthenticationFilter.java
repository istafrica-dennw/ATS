package com.ats.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, UserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            if (jwt != null) {
                System.out.println("[DEBUG] JwtAuthenticationFilter - Processing token: " + jwt.substring(0, Math.min(20, jwt.length())) + "...");
                
                boolean isValid = tokenProvider.validateToken(jwt);
                System.out.println("[DEBUG] JwtAuthenticationFilter - Token validation result: " + isValid);
                
                if (isValid) {
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    System.out.println("[DEBUG] JwtAuthenticationFilter - Username from token: " + username);
                    
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        System.out.println("[DEBUG] JwtAuthenticationFilter - User details loaded successfully for: " + username);
                        System.out.println("[DEBUG] JwtAuthenticationFilter - Authorities: " + userDetails.getAuthorities());
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        System.out.println("[DEBUG] JwtAuthenticationFilter - Authentication set in SecurityContextHolder");
                    } catch (Exception e) {
                        System.out.println("[ERROR] JwtAuthenticationFilter - Error loading user details: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
} 