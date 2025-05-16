package com.ats.aspect;

import com.ats.annotation.RequiresAuthentication;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Map;

@Aspect
@Component
public class AuthenticationAspect {

    @Around("@annotation(com.ats.annotation.RequiresAuthentication)")
    public Object checkAuthentication(ProceedingJoinPoint joinPoint) throws Throwable {
        // Get method signature
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // Get the custom message from the annotation
        RequiresAuthentication annotation = method.getAnnotation(RequiresAuthentication.class);
        String message = annotation.message();
        
        // Get parameter types and values
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();
        
        // Find the Authentication parameter
        Authentication authentication = null;
        for (int i = 0; i < parameters.length; i++) {
            if (Authentication.class.isAssignableFrom(parameters[i].getType())) {
                authentication = (Authentication) args[i];
                break;
            }
        }
        
        // Check if authentication is null
        if (authentication == null) {
            System.out.println("[DEBUG] AuthenticationAspect - Null authentication detected for method: " + method.getName());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", message));
        }
        
        // Proceed with the method execution
        return joinPoint.proceed();
    }
} 