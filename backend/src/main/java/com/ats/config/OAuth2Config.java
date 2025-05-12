package com.ats.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationResponse;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequestEntityConverter;
import org.springframework.util.MultiValueMap;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.RequestEntity;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import java.util.Collections;

@Configuration
public class OAuth2Config {

    @Value("${spring.security.oauth2.client.registration.linkedin.client-id}")
    private String linkedinClientId;

    @Value("${spring.security.oauth2.client.registration.linkedin.client-secret}")
    private String linkedinClientSecret;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(
                linkedInClientRegistration()
        );
    }

    private ClientRegistration linkedInClientRegistration() {
        return ClientRegistration.withRegistrationId("linkedin")
                .clientId(linkedinClientId)
                .clientSecret(linkedinClientSecret)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile", "email")
                .authorizationUri("https://www.linkedin.com/oauth/v2/authorization")
                .tokenUri("https://www.linkedin.com/oauth/v2/accessToken")
                .userInfoUri("https://api.linkedin.com/v2/userinfo")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .jwkSetUri("https://www.linkedin.com/oauth/openid/jwks")
                .clientName("LinkedIn")
                .build();
    }

    @Bean
    public OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient() {
        DefaultAuthorizationCodeTokenResponseClient tokenResponseClient = new DefaultAuthorizationCodeTokenResponseClient();
        
        // Add custom converter to log the request before it's sent
        tokenResponseClient.setRequestEntityConverter(new DebugAuthorizationCodeGrantRequestConverter());
        
        // Add custom response error handler
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        
        // Add interceptor to log the request and response
        restTemplate.getInterceptors().add((request, body, execution) -> {
            System.out.println("\n\n[DEBUG] ===== TOKEN REQUEST DEBUG =====");
            System.out.println("[DEBUG] Token request URI: " + request.getURI());
            System.out.println("[DEBUG] Token request method: " + request.getMethod());
            System.out.println("[DEBUG] Token request headers: " + request.getHeaders());
            
            ClientHttpResponse response = execution.execute(request, body);
            
            System.out.println("[DEBUG] Token response status: " + response.getStatusCode());
            System.out.println("[DEBUG] Token response headers: " + response.getHeaders());
            
            // Read the body without consuming the input stream
            try {
                byte[] bodyBytes = response.getBody().readAllBytes();
                String responseBody = new String(bodyBytes);
                System.out.println("[DEBUG] Token response body: " + responseBody);
                
                // Create a new response with the same content
                return new ClientHttpResponse() {
                    @Override
                    public HttpStatusCode getStatusCode() throws IOException {
                        return response.getStatusCode();
                    }
                    
                    @Override
                    public String getStatusText() throws IOException {
                        return response.getStatusText();
                    }
                    
                    @Override
                    public void close() {
                        response.close();
                    }
                    
                    @Override
                    public InputStream getBody() throws IOException {
                        return new ByteArrayInputStream(bodyBytes);
                    }
                    
                    @Override
                    public org.springframework.http.HttpHeaders getHeaders() {
                        return response.getHeaders();
                    }
                };
            } catch (IOException e) {
                System.out.println("[DEBUG] Error reading response body: " + e.getMessage());
                return response;
            }
        });
        
        tokenResponseClient.setRestOperations(restTemplate);
        
        // Set our custom token response converter
        TokenResponseConverter converter = new TokenResponseConverter();
        restTemplate.getMessageConverters().add(0, converter);
        
        // Wrap the client to debug the OAuth2AccessTokenResponse
        return new OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest>() {
            @Override
            public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest authorizationGrantRequest) {
                System.out.println("\n\n[DEBUG] ===== AUTHORIZATION CODE GRANT REQUEST DEBUG =====");
                
                OAuth2AuthorizationRequest authorizationRequest = authorizationGrantRequest.getAuthorizationExchange().getAuthorizationRequest();
                OAuth2AuthorizationResponse authorizationResponse = authorizationGrantRequest.getAuthorizationExchange().getAuthorizationResponse();
                
                System.out.println("[DEBUG] Authorization request state: " + authorizationRequest.getState());
                System.out.println("[DEBUG] Authorization response state: " + authorizationResponse.getState());
                
                System.out.println("[DEBUG] Authorization request additional parameters: " + authorizationRequest.getAdditionalParameters());
                if (authorizationRequest.getAdditionalParameters().containsKey("nonce")) {
                    System.out.println("[DEBUG] Nonce in authorization request: " + authorizationRequest.getAdditionalParameters().get("nonce"));
                } else {
                    System.out.println("[DEBUG] WARNING: No nonce in authorization request additional parameters!");
                }
                
                try {
                    OAuth2AccessTokenResponse response = tokenResponseClient.getTokenResponse(authorizationGrantRequest);
                    
                    // Safety check for null response
                    if (response == null) {
                        System.out.println("[DEBUG] CRITICAL ERROR: Got null response from tokenResponseClient");
                        throw new IllegalStateException("Token response is null");
                    }
                    
                    // Debug the token response in detail
                    System.out.println("[DEBUG] Token response: " + response);
                    System.out.println("[DEBUG] Token response additional parameters: " + response.getAdditionalParameters());
                    
                    // Carefully check access token
                    if (response.getAccessToken() != null) {
                        System.out.println("[DEBUG] Token response access token: " + response.getAccessToken().getTokenValue());
                        System.out.println("[DEBUG] Token response token type: " + response.getAccessToken().getTokenType().getValue());
                        System.out.println("[DEBUG] Token response scopes: " + response.getAccessToken().getScopes());
                        System.out.println("[DEBUG] Token response expires in: " + response.getAccessToken().getExpiresAt());
                    } else {
                        System.out.println("[DEBUG] WARNING: Access token is null in response");
                    }
                    
                    // Check refresh token
                    System.out.println("[DEBUG] Token response refresh token: " + (response.getRefreshToken() != null ? response.getRefreshToken().getTokenValue() : "null"));
                    
                    if (response.getAdditionalParameters().containsKey("id_token")) {
                        System.out.println("[DEBUG] ID token found in response parameters");
                        String idTokenValue = (String) response.getAdditionalParameters().get("id_token");
                        
                        // Debug the ID token to check its contents
                        try {
                            String[] parts = idTokenValue.split("\\.");
                            if (parts.length >= 2) {
                                byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(parts[1]);
                                String decodedBody = new String(decodedBytes);
                                System.out.println("[DEBUG] ID token decoded payload: " + decodedBody);
                                
                                // Check if there's a nonce in the decoded payload
                                if (decodedBody.contains("\"nonce\"")) {
                                    System.out.println("[DEBUG] ID token contains a nonce claim");
                                } else {
                                    System.out.println("[DEBUG] WARNING: ID token does NOT contain a nonce claim");
                                }
                            }
                        } catch (Exception e) {
                            System.out.println("[DEBUG] Error decoding ID token: " + e.getMessage());
                        }
                        
                        // This is critical - make sure nonce is in the additional parameters
                        Map<String, Object> additionalParameters = new HashMap<>(response.getAdditionalParameters());
                        
                        // Check if we need to add nonce from the original request to the token response
                        if (!additionalParameters.containsKey("nonce") && authorizationRequest.getAdditionalParameters().containsKey("nonce")) {
                            String nonce = (String) authorizationRequest.getAdditionalParameters().get("nonce");
                            System.out.println("[DEBUG] *** IMPORTANT *** Adding nonce from authorization request to token response: " + nonce);
                            additionalParameters.put("nonce", nonce);
                            
                            try {
                                // First, verify that access token exists in the original response
                                if (response.getAccessToken() == null) {
                                    System.out.println("[DEBUG] Access token is null in original response, creating from scratch");
                                    
                                    // Extract token details from the original map instead
                                    String accessTokenValue = (String) response.getAdditionalParameters().get("access_token");
                                    String tokenType = (String) response.getAdditionalParameters().get("token_type");
                                    long expiresIn = 3600L; // Default to 1 hour
                                    
                                    // Get expiration if available
                                    if (additionalParameters.containsKey("expires_in")) {
                                        try {
                                            expiresIn = Long.parseLong(additionalParameters.get("expires_in").toString());
                                        } catch (NumberFormatException e) {
                                            System.out.println("[DEBUG] Could not parse expires_in, using default: " + e.getMessage());
                                        }
                                    }
                                    
                                    System.out.println("[DEBUG] Creating OAuth2AccessTokenResponse with token value: " + accessTokenValue);
                                    System.out.println("[DEBUG] Token type: " + tokenType);
                                    System.out.println("[DEBUG] Expires in: " + expiresIn);
                                    
                                    // Create the response
                                    OAuth2AccessTokenResponse modifiedResponse = OAuth2AccessTokenResponse
                                        .withToken(accessTokenValue)
                                        .tokenType(org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType.BEARER)
                                        .expiresIn(expiresIn)
                                        .additionalParameters(additionalParameters)
                                        .build();
                                        
                                    System.out.println("[DEBUG] Created new OAuth2AccessTokenResponse");
                                    System.out.println("[DEBUG] Modified response has access token: " + (modifiedResponse.getAccessToken() != null));
                                    if (modifiedResponse.getAccessToken() != null) {
                                        System.out.println("[DEBUG] Access token value: " + modifiedResponse.getAccessToken().getTokenValue());
                                    }
                                    return modifiedResponse;
                                } else {
                                    // Create a new response with the modified additional parameters
                                    OAuth2AccessTokenResponse modifiedResponse = OAuth2AccessTokenResponse
                                        .withToken(response.getAccessToken().getTokenValue())
                                        .tokenType(response.getAccessToken().getTokenType())
                                        .expiresIn(response.getAccessToken().getExpiresAt() != null ? 
                                            java.time.Duration.between(java.time.Instant.now(), response.getAccessToken().getExpiresAt()).getSeconds() :
                                            3600)
                                        .scopes(response.getAccessToken().getScopes())
                                        .refreshToken(response.getRefreshToken() != null ? response.getRefreshToken().getTokenValue() : null)
                                        .additionalParameters(additionalParameters)
                                        .build();
                                        
                                    System.out.println("[DEBUG] Modified token response additional parameters: " + modifiedResponse.getAdditionalParameters());
                                    System.out.println("[DEBUG] Modified token response has access token: " + (modifiedResponse.getAccessToken() != null));
                                    return modifiedResponse;
                                }
                            } catch (Exception e) {
                                System.out.println("[DEBUG] Error creating modified response: " + e.getMessage());
                                e.printStackTrace();
                            }
                        }
                    } else {
                        System.out.println("[DEBUG] No ID token in token response additional parameters");
                    }
                    
                    System.out.println("[DEBUG] ======================\n");
                    return response;
                } catch (OAuth2AuthenticationException e) {
                    System.out.println("[DEBUG] OAuth2 Authentication Exception: " + e.getMessage());
                    e.printStackTrace();
                    System.out.println("[DEBUG] ======================\n");
                    throw e;
                }
            }
        };
    }
    
    // Custom token response converter
    private static class TokenResponseConverter implements org.springframework.http.converter.HttpMessageConverter<OAuth2AccessTokenResponse> {
        private final org.springframework.http.converter.json.MappingJackson2HttpMessageConverter delegate;
        
        public TokenResponseConverter() {
            this.delegate = new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter();
        }
        
        @Override
        public boolean canRead(Class<?> clazz, org.springframework.http.MediaType mediaType) {
            return OAuth2AccessTokenResponse.class.isAssignableFrom(clazz);
        }
        
        @Override
        public boolean canWrite(Class<?> clazz, org.springframework.http.MediaType mediaType) {
            return OAuth2AccessTokenResponse.class.isAssignableFrom(clazz);
        }
        
        @Override
        public List<org.springframework.http.MediaType> getSupportedMediaTypes() {
            return delegate.getSupportedMediaTypes();
        }
        
        @Override
        public OAuth2AccessTokenResponse read(Class<? extends OAuth2AccessTokenResponse> clazz, 
                                             org.springframework.http.HttpInputMessage inputMessage) 
                                             throws java.io.IOException, org.springframework.http.converter.HttpMessageNotReadableException {
            
            System.out.println("[DEBUG] Custom TokenResponseConverter.read called");
            
            try {
                // Read the response as a map
                @SuppressWarnings("unchecked")
                Map<String, Object> tokenResponseParameters = (Map<String, Object>) delegate.read(Map.class, inputMessage);
                System.out.println("[DEBUG] Token response parameters: " + tokenResponseParameters);
                
                // Extract values
                String accessToken = (String) tokenResponseParameters.get("access_token");
                String tokenType = (String) tokenResponseParameters.get("token_type");
                Long expiresIn = null;
                
                if (tokenResponseParameters.containsKey("expires_in") && tokenResponseParameters.get("expires_in") != null) {
                    try {
                        expiresIn = Long.valueOf(String.valueOf(tokenResponseParameters.get("expires_in")));
                    } catch (NumberFormatException e) {
                        System.out.println("[DEBUG] Error parsing expires_in: " + e.getMessage());
                    }
                }
                
                // Process scopes
                Set<String> scopes = Collections.emptySet();
                if (tokenResponseParameters.containsKey("scope")) {
                    String scope = (String) tokenResponseParameters.get("scope");
                    if (scope != null) {
                        scopes = new HashSet<>(Arrays.asList(scope.split(",")));
                    }
                }
                
                // Process additional parameters (exclude standard parameters)
                Map<String, Object> additionalParameters = new HashMap<>(tokenResponseParameters);
                additionalParameters.remove("access_token");
                additionalParameters.remove("token_type");
                additionalParameters.remove("expires_in");
                additionalParameters.remove("scope");
                additionalParameters.remove("refresh_token");
                
                // Build the response
                OAuth2AccessTokenResponse.Builder builder = OAuth2AccessTokenResponse
                    .withToken(accessToken)
                    .tokenType(OAuth2AccessToken.TokenType.BEARER)
                    .additionalParameters(additionalParameters);
                
                if (expiresIn != null) {
                    builder.expiresIn(expiresIn);
                }
                
                if (!scopes.isEmpty()) {
                    builder.scopes(scopes);
                }
                
                if (tokenResponseParameters.containsKey("refresh_token")) {
                    builder.refreshToken((String) tokenResponseParameters.get("refresh_token"));
                }
                
                OAuth2AccessTokenResponse response = builder.build();
                System.out.println("[DEBUG] Built OAuth2AccessTokenResponse: " + response);
                System.out.println("[DEBUG] Has access token: " + (response.getAccessToken() != null));
                return response;
            } catch (Exception e) {
                System.out.println("[DEBUG] Error reading token response: " + e.getMessage());
                e.printStackTrace();
                throw new org.springframework.http.converter.HttpMessageNotReadableException(
                    "Error reading OAuth2 Access Token Response: " + e.getMessage(), e, inputMessage);
            }
        }
        
        @Override
        public void write(OAuth2AccessTokenResponse t, org.springframework.http.MediaType contentType, 
                         org.springframework.http.HttpOutputMessage outputMessage) 
                         throws java.io.IOException, org.springframework.http.converter.HttpMessageNotWritableException {
            throw new UnsupportedOperationException("Not implemented");
        }
    }
    
    // Custom request converter for debugging
    private static class DebugAuthorizationCodeGrantRequestConverter implements Converter<OAuth2AuthorizationCodeGrantRequest, RequestEntity<?>> {
        private final OAuth2AuthorizationCodeGrantRequestEntityConverter defaultConverter = 
            new OAuth2AuthorizationCodeGrantRequestEntityConverter();
            
        @Override
        public RequestEntity<?> convert(OAuth2AuthorizationCodeGrantRequest request) {
            RequestEntity<?> entity = defaultConverter.convert(request);
            
            if (entity != null && entity.getBody() instanceof MultiValueMap) {
                @SuppressWarnings("unchecked")
                MultiValueMap<String, String> body = (MultiValueMap<String, String>) entity.getBody();
                System.out.println("[DEBUG] Token request body parameters: " + body);
            }
            
            return entity;
        }
    }
} 