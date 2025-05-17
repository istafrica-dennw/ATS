package com.ats.aspect;

import com.ats.annotation.Require2FA;
import com.ats.dto.UserDTO;
import com.ats.exception.MfaRequiredException;
import com.ats.model.Role;
import com.ats.service.UserService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

@Aspect
@Component
public class MfaRequirementAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(MfaRequirementAspect.class);
    
    private final UserService userService;
    
    public MfaRequirementAspect(UserService userService) {
        this.userService = userService;
    }
    
    @Around("@annotation(com.ats.annotation.Require2FA) || @within(com.ats.annotation.Require2FA)")
    public Object enforce2FARequirement(ProceedingJoinPoint joinPoint) throws Throwable {
        logger.debug("Checking 2FA requirement for {}", joinPoint.getSignature().toShortString());
        
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated access attempt to 2FA protected resource");
            throw new MfaRequiredException("Authentication required");
        }
        
        String email = authentication.getName();
        UserDTO user = userService.getUserByEmail(email);
        
        if (user == null) {
            logger.warn("Authenticated user not found in database: {}", email);
            throw new MfaRequiredException("User not found");
        }
        
        // Get the roles for which 2FA is required from the annotation
        Require2FA require2FA = getRequire2FAAnnotation(joinPoint);
        String[] requiredRoles = require2FA.roles();
        
        boolean shouldEnforce2FA = false;
        
        // If no specific roles are defined, enforce 2FA for all users accessing this endpoint
        if (requiredRoles.length == 0) {
            shouldEnforce2FA = true;
            logger.debug("2FA required for all users accessing this endpoint");
        } else {
            // Check if the user has any of the roles for which 2FA is required
            List<String> userRoles = Arrays.asList(user.getRole().toString());
            for (String role : requiredRoles) {
                if (userRoles.contains(role)) {
                    shouldEnforce2FA = true;
                    logger.debug("User has role {} which requires 2FA", role);
                    break;
                }
            }
        }
        
        if (shouldEnforce2FA) {
            // Check if the user has 2FA enabled
            if (user.getMfaEnabled() == null || !user.getMfaEnabled()) {
                logger.warn("User {} attempted to access 2FA-required resource without 2FA enabled", email);
                throw new MfaRequiredException("Two-factor authentication is required for this operation");
            }
        }
        
        // If we get here, either 2FA is not required for this user's role, or the user has 2FA enabled
        return joinPoint.proceed();
    }
    
    private Require2FA getRequire2FAAnnotation(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // First check if the method has the annotation
        Require2FA methodAnnotation = method.getAnnotation(Require2FA.class);
        if (methodAnnotation != null) {
            return methodAnnotation;
        }
        
        // If not, check if the class has the annotation
        return method.getDeclaringClass().getAnnotation(Require2FA.class);
    }
} 