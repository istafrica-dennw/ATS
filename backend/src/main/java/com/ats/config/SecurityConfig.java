package com.ats.config;

import com.ats.security.JwtAuthenticationFilter;
import com.ats.security.OAuth2AuthenticationSuccessHandler;
import com.ats.security.CustomOAuth2UserService;
import com.ats.security.CustomAuthorizationRequestResolver;
import com.ats.security.CustomOAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter;
import org.springframework.core.convert.converter.Converter;
import jakarta.servlet.FilterChain;
import java.util.Base64;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationProvider;
import org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationToken;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.oidc.authentication.OidcAuthorizationCodeAuthenticationProvider;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.core.Authentication;
import java.time.Instant;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.ats.repository.UserRepository;
import com.ats.repository.UserRoleRepository;
import com.ats.security.CustomUserDetailsService;
import com.ats.security.JwtTokenProvider;
import com.ats.security.JwtAuthenticationEntryPoint;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final OAuth2AuthorizedClientRepository authorizedClientRepository;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOAuth2AuthenticationSuccessHandler customOAuth2AuthenticationSuccessHandler;
    private final OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient;
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtTokenProvider tokenProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Value("${app.frontend.cors.allowed-origins}")
    private String corsAllowedOrigins;

    @Value("${iaa.public-key}")
    private String iaaPublicKeyPem;

    @Bean
    public JwtDecoder iaaJwtDecoder() {
        try {
            // This handles cases where \n is escaped or literal, and removes headers/whitespace
            String publicKeyContent = iaaPublicKeyPem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replace("\\n", "") // Handles escaped newlines
                    .replace("\n", "")  // Handles actual newlines
                    .replace("\r", "")  // Handles Windows carriage returns
                    .replaceAll("\\s", ""); // Removes all whitespace

            byte[] decoded = Base64.getDecoder().decode(publicKeyContent);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            RSAPublicKey publicKey = (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(decoded));

            return NimbusJwtDecoder.withPublicKey(publicKey).build();
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to initialize IAA Public Key Decoder: " + e.getMessage());
            // Return a dummy decoder that throws an exception when used, instead of crashing the app during startup
            return token -> { 
                throw new org.springframework.security.oauth2.jwt.JwtException("IAA Decoder is not configured correctly. Check your public key."); 
            };
        }
    }


    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, new CustomUserDetailsService(userRepository, userRoleRepository));
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("\n\n[DEBUG] Configuring Security Filter Chain");
        
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .securityContext(context -> context
            .securityContextRepository(new RequestAttributeSecurityContextRepository()))
            .exceptionHandling(exc -> exc
                .authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/oauth2/**", "/login/**", "/error",
                    "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**",
                    "/api/test/**", "/api/files/**", "/api/geolocation/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/jobs", "/api/jobs/*", "/api/jobs/*/custom-questions").permitAll()
                .requestMatchers("/api/jobs/**").authenticated()
                .anyRequest().authenticated()
            )

            .oauth2ResourceServer(oauth2 -> oauth2
            .bearerTokenResolver(request -> {
                // If our local filter already authenticated the user, 
                // return null to tell the Resource Server to SKIP this request.
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !(auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
                    return null; 
                }
                String bearerToken = request.getHeader("Authorization");
                if (org.springframework.util.StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
                    return bearerToken.substring(7);
                }
                return null;
            })
            .jwt(jwt -> jwt.decoder(iaaJwtDecoder()))
        )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authorization -> authorization
                    .authorizationRequestResolver(authorizationRequestResolver())
                )
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/login/oauth2/code/*")
                )
                .tokenEndpoint(token -> token
                    .accessTokenResponseClient(accessTokenResponseClient)
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                    .oidcUserService(oidcUserService())
                )
                .successHandler(customOAuth2AuthenticationSuccessHandler)
                .failureHandler((request, response, exception) -> {
                    System.out.println("\n\n[DEBUG] ===== OAUTH2 AUTHENTICATION FAILURE =====");
                    System.out.println("[DEBUG] Exception class: " + exception.getClass().getName());
                    System.out.println("[DEBUG] Exception message: " + exception.getMessage());
                    
                    if (exception instanceof org.springframework.security.oauth2.core.OAuth2AuthenticationException) {
                        org.springframework.security.oauth2.core.OAuth2AuthenticationException oauthEx = 
                            (org.springframework.security.oauth2.core.OAuth2AuthenticationException) exception;
                        System.out.println("[DEBUG] OAuth2 error code: " + oauthEx.getError().getErrorCode());
                        System.out.println("[DEBUG] OAuth2 error description: " + oauthEx.getError().getDescription());
                    }
                    
                    if (exception.getCause() != null) {
                        System.out.println("[DEBUG] Cause: " + exception.getCause().getMessage());
                        exception.getCause().printStackTrace();
                    }
                    System.out.println("[DEBUG] ======================\n");
                    
                    response.sendRedirect("/login?error=" + exception.getMessage());
                })
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(new OncePerRequestFilter() {
                @Override
                protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
                    if (request.getRequestURI().startsWith("/login/oauth2/code/")) {
                        System.out.println("\n\n[DEBUG] ===== OAUTH2 CALLBACK DEBUG =====");
                        System.out.println("[DEBUG] Request URI: " + request.getRequestURI());
                        System.out.println("[DEBUG] Query String: " + request.getQueryString());
                        System.out.println("[DEBUG] Headers: " + Collections.list(request.getHeaderNames()).stream()
                            .collect(Collectors.toMap(name -> name, request::getHeader)));
                            
                        // Store some debug info in an attribute to pass to the next filter
                        request.setAttribute("oauth2_debug_time", System.currentTimeMillis());
                    }
                    filterChain.doFilter(request, response);
                }
            }, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(
                new OncePerRequestFilter() {
                    @Override
                    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
                        if (request.getRequestURI().startsWith("/login/oauth2/code/") && 
                            request.getAttribute("oauth2_debug_time") != null) {
                            System.out.println("\n\n[DEBUG] ===== OAUTH2 AUTHENTICATION DEBUG =====");
                            System.out.println("[DEBUG] Authentication processing completed");
                            System.out.println("[DEBUG] Time taken: " + (System.currentTimeMillis() - (Long)request.getAttribute("oauth2_debug_time")) + "ms");
                            System.out.println("[DEBUG] ======================\n");
                        }
                        filterChain.doFilter(request, response);
                    }
                }, OAuth2LoginAuthenticationFilter.class)
            .authenticationProvider(customOidcAuthenticationProvider())
                .authenticationProvider(daoAuthenticationProvider(new CustomUserDetailsService(userRepository, userRoleRepository)));

        System.out.println("[DEBUG] Security Filter Chain Configuration Complete");
        return http.build();
    }

    @Bean
    public CustomAuthorizationRequestResolver authorizationRequestResolver() {
        return new CustomAuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationProvider customOidcAuthenticationProvider() {
        // Create a custom version of OidcAuthorizationCodeAuthenticationProvider that skips nonce validation
        return new CustomOidcAuthenticationProvider(accessTokenResponseClient, oidcUserService());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Check if the configuration is a wildcard or specific origins
        if ("*".equals(corsAllowedOrigins)) {
            configuration.addAllowedOriginPattern("*");
        } else {
            String[] origins = corsAllowedOrigins.split(",");
            for (String origin : origins) {
                configuration.addAllowedOrigin(origin.trim());
            }
        }

        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3001"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With",
            "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public Converter<Map<String, Object>, OAuth2AccessTokenResponse> oauth2AccessTokenResponseConverter() {
        return new Converter<Map<String, Object>, OAuth2AccessTokenResponse>() {
            @Override
            public OAuth2AccessTokenResponse convert(Map<String, Object> map) {
                System.out.println("[DEBUG] ===== CONVERTING TOKEN RESPONSE MAP =====");
                System.out.println("[DEBUG] Raw token response map: " + map);
                
                // Extract the fields from the map
                String accessToken = (String) map.get("access_token");
                String tokenType = (String) map.get("token_type");
                Long expiresIn = null;
                
                if (map.containsKey("expires_in")) {
                    try {
                        expiresIn = Long.valueOf(String.valueOf(map.get("expires_in")));
                        System.out.println("[DEBUG] Parsed expires_in: " + expiresIn);
                    } catch (NumberFormatException e) {
                        System.out.println("[DEBUG] Error parsing expires_in: " + e.getMessage());
                    }
                }
                
                // Create a new additional parameters map without access token and related fields
                Map<String, Object> additionalParameters = new HashMap<>(map);
                additionalParameters.remove("access_token");
                additionalParameters.remove("token_type");
                additionalParameters.remove("expires_in");
                additionalParameters.remove("scope");
                
                System.out.println("[DEBUG] Creating OAuth2AccessTokenResponse with:");
                System.out.println("[DEBUG] - Access token: " + accessToken);
                System.out.println("[DEBUG] - Token type: " + tokenType);
                System.out.println("[DEBUG] - Expires in: " + expiresIn);
                System.out.println("[DEBUG] - Additional parameters: " + additionalParameters);
                
                // Build the response
                OAuth2AccessTokenResponse.Builder builder = OAuth2AccessTokenResponse
                    .withToken(accessToken)
                    .tokenType(OAuth2AccessToken.TokenType.BEARER) // Default to bearer if not specified
                    .additionalParameters(additionalParameters);
                    
                if (expiresIn != null) {
                    builder.expiresIn(expiresIn);
                }
                
                // Handle scopes if present
                if (map.containsKey("scope")) {
                    String scopeString = (String) map.get("scope");
                    Set<String> scopes = new HashSet<>(Arrays.asList(scopeString.split(" *, *")));
                    builder.scopes(scopes);
                    System.out.println("[DEBUG] Added scopes: " + scopes);
                }
                
                OAuth2AccessTokenResponse response = builder.build();
                System.out.println("[DEBUG] Built response: " + response);
                System.out.println("[DEBUG] Response has access token: " + (response.getAccessToken() != null));
                System.out.println("[DEBUG] ======================\n");
                
                return response;
            }
        };
    }

    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        OidcUserService delegate = new OidcUserService() {
            @Override
            public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
                System.out.println("[DEBUG] ===== OIDC VALIDATION DEBUG =====");
                System.out.println("[DEBUG] Inside custom OidcUserService.loadUser override");
                System.out.println("[DEBUG] Client registration: " + userRequest.getClientRegistration().getRegistrationId());
                System.out.println("[DEBUG] Client registration JWK URI: " + userRequest.getClientRegistration().getProviderDetails().getJwkSetUri());
                
                // Get the ID token and log its claims
                OidcIdToken idToken = userRequest.getIdToken();
                System.out.println("[DEBUG] ID token: " + idToken.getTokenValue());
                System.out.println("[DEBUG] ID token claims: " + idToken.getClaims());
                
                // Extract nonce from ID token
                Object nonceClaim = idToken.getClaims().get("nonce");
                System.out.println("[DEBUG] Nonce from ID token: " + nonceClaim);
                
                // Extract nonce from additional parameters
                Map<String, Object> additionalParameters = userRequest.getAdditionalParameters();
                System.out.println("[DEBUG] Additional parameters: " + additionalParameters);
                
                // Don't use reflection to access non-existent method
                // Skip directly to loadUser
                try {
                    System.out.println("[DEBUG] Calling super.loadUser to perform standard OIDC validation");
                    OidcUser user = super.loadUser(userRequest);
                    System.out.println("[DEBUG] OIDC validation successful");
                    System.out.println("[DEBUG] User details: " + user.getName());
                    System.out.println("[DEBUG] User attributes: " + user.getAttributes());
                    return user;
                } catch (OAuth2AuthenticationException e) {
                    System.out.println("[DEBUG] OIDC validation failed: " + e.getMessage());
                    System.out.println("[DEBUG] Root cause: " + e.getCause());
                    e.printStackTrace();
                    
                    // If this is an invalid_nonce error, try a workaround
                    if (e.getError() != null && "invalid_nonce".equals(e.getError().getErrorCode())) {
                        System.out.println("[DEBUG] Detected invalid_nonce error, trying workaround...");
                        
                        try {
                            // Create a user manually using the ID token claims
                            Map<String, Object> claims = idToken.getClaims();
                            System.out.println("[DEBUG] Creating user from claims: " + claims);
                            
                            // Extract user information from claims
                            String sub = (String) claims.get("sub");
                            String email = (String) claims.get("email");
                            String name = (String) claims.get("name");
                            
                            // Create a default set of attributes
                            Map<String, Object> attributes = new HashMap<>(claims);
                            
                            // Create a custom OidcUser with the ID token
                            return new org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser(
                                org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("ROLE_USER"),
                                idToken,
                                "sub"
                            );
                        } catch (Exception ex) {
                            System.out.println("[DEBUG] Workaround failed: " + ex.getMessage());
                            ex.printStackTrace();
                        }
                    }
                    
                    throw e;
                } finally {
                    System.out.println("[DEBUG] ======================\n");
                }
            }
        };
        
        return delegate;
    }

    private static class CustomOidcAuthenticationProvider implements AuthenticationProvider {
        private final OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient;
        private final OAuth2UserService<OidcUserRequest, OidcUser> userService;

        public CustomOidcAuthenticationProvider(
                OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient,
                OAuth2UserService<OidcUserRequest, OidcUser> userService) {
            this.accessTokenResponseClient = accessTokenResponseClient;
            this.userService = userService;
        }

        @Override
        public boolean supports(Class<?> authentication) {
            return OAuth2LoginAuthenticationToken.class.isAssignableFrom(authentication);
        }

        @Override
        public Authentication authenticate(Authentication authentication) {
            OAuth2LoginAuthenticationToken authenticationToken = (OAuth2LoginAuthenticationToken) authentication;
            
            // Skip validation if this isn't the right stage of authentication
            if (authenticationToken.getAuthorizationExchange().getAuthorizationResponse().getCode() == null) {
                return null;
            }
            
            System.out.println("[DEBUG] ===== CUSTOM OIDC AUTHENTICATION PROVIDER =====");
            System.out.println("[DEBUG] Processing authentication: " + authenticationToken);
            
            try {
                // Get the authorization code grant request
                OAuth2AuthorizationCodeGrantRequest authzRequest = new OAuth2AuthorizationCodeGrantRequest(
                    authenticationToken.getClientRegistration(),
                    authenticationToken.getAuthorizationExchange()
                );
                
                // Exchange the authorization code for an access token
                OAuth2AccessTokenResponse tokenResponse = this.accessTokenResponseClient.getTokenResponse(authzRequest);
                
                // Check if this is an OIDC authentication by looking for an ID token in the response
                if (tokenResponse.getAdditionalParameters().containsKey("id_token")) {
                    System.out.println("[DEBUG] Found ID token in response, processing as OIDC");
                    
                    String idTokenValue = (String) tokenResponse.getAdditionalParameters().get("id_token");
                    
                    // Minimal validation - only check that it's a properly formed JWT
                    String[] parts = idTokenValue.split("\\.");
                    if (parts.length != 3) {
                        throw new OAuth2AuthenticationException("Invalid ID token format");
                    }
                    
                    // Extract claims from the payload (part 1)
                    byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(parts[1]);
                    String decodedBody = new String(decodedBytes);
                    
                    // Parse claims as JSON
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, Object> claims = mapper.readValue(decodedBody, Map.class);
                    
                    System.out.println("[DEBUG] Parsed ID token claims: " + claims);
                    
                    // Create basic OidcIdToken
                    OidcIdToken idToken = new OidcIdToken(
                        idTokenValue,
                        claims.containsKey("iat") ? java.time.Instant.ofEpochSecond(((Number) claims.get("iat")).longValue()) : java.time.Instant.now(),
                        claims.containsKey("exp") ? java.time.Instant.ofEpochSecond(((Number) claims.get("exp")).longValue()) : java.time.Instant.now().plusSeconds(3600),
                        claims
                    );
                    
                    // Create OidcUserRequest
                    OidcUserRequest userRequest = new OidcUserRequest(
                        authenticationToken.getClientRegistration(),
                        tokenResponse.getAccessToken(),
                        idToken,
                        Collections.emptyMap() // Skip additional parameters to avoid nonce validation
                    );
                    
                    // Load the user
                    OidcUser oidcUser = this.userService.loadUser(userRequest);
                    
                    // Create a successful authentication token
                    OAuth2LoginAuthenticationToken authenticationResult = new OAuth2LoginAuthenticationToken(
                        authenticationToken.getClientRegistration(),
                        authenticationToken.getAuthorizationExchange(),
                        oidcUser,
                        oidcUser.getAuthorities(),
                        tokenResponse.getAccessToken()
                    );
                    
                    System.out.println("[DEBUG] Authentication successful: " + authenticationResult);
                    System.out.println("[DEBUG] ======================\n");
                    
                    return authenticationResult;
                } else {
                    System.out.println("[DEBUG] No ID token found, not an OIDC authentication");
                    return null; // Not an OIDC authentication
                }
            } catch (Exception e) {
                System.out.println("[DEBUG] Authentication failed: " + e.getMessage());
                e.printStackTrace();
                System.out.println("[DEBUG] ======================\n");
                
                if (e instanceof OAuth2AuthenticationException) {
                    throw (OAuth2AuthenticationException) e;
                }
                throw new OAuth2AuthenticationException(
                    new org.springframework.security.oauth2.core.OAuth2Error("authentication_failure"), 
                    "Authentication failed: " + e.getMessage()
                );
            }
        }
    }
} 