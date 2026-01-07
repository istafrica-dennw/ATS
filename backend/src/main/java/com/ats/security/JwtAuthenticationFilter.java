package com.ats.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component; // Added this import
import java.io.IOException;

@Component
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
        String header = request.getHeader("Authorization");
        
        // DEBUG: Monitor incoming headers
        if (header != null) {
            System.out.println("[DEBUG] JwtAuthenticationFilter - Found Authorization Header for " + request.getRequestURI());
        }

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            // Skip if user is already authenticated (e.g. by IAA Resource Server)
            if (auth != null && auth.isAuthenticated() && 
               !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                filterChain.doFilter(request, response);
                return;
            }

            String jwt = getJwtFromRequest(request);
            if (jwt != null) {
                // Check if this is a local ATS token
                if (tokenProvider.validateToken(jwt)) {
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("[DEBUG] JwtAuthenticationFilter - Local ATS Login successful for: " + username);
                } else {
                    // This is likely an IAA token; we leave it for the Resource Server to handle
                    System.out.println("[DEBUG] JwtAuthenticationFilter - Token failed local validation. Passing to IAA Resource Server.");
                }
            }
        } catch (Exception ex) {
            System.err.println("[ERROR] JwtAuthenticationFilter - Error: " + ex.getMessage());
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