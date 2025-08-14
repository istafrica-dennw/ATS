/**
 * Utility functions for token handling and validation
 */

/**
 * Check if a token is a JWT (JSON Web Token)
 * JWT tokens have exactly 3 parts separated by dots (header.payload.signature)
 * Each part should be base64url encoded
 * 
 * @param token - The token string to validate
 * @returns true if the token is a valid JWT format, false otherwise
 */
export const isJWTToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT tokens have exactly 3 parts separated by dots (header.payload.signature)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Each part should be base64url encoded (contains letters, numbers, -, _)
  // Base64url uses A-Z, a-z, 0-9, -, _ (no padding)
  const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => base64UrlPattern.test(part) && part.length > 0);
};

/**
 * Determine if a token is likely an authentication JWT or a simple verification token
 * 
 * @param token - The token string to analyze
 * @returns 'jwt' for JWT tokens, 'verification' for simple tokens, 'invalid' for invalid tokens
 */
export const getTokenType = (token: string): 'jwt' | 'verification' | 'invalid' => {
  if (!token || typeof token !== 'string') {
    return 'invalid';
  }

  if (isJWTToken(token)) {
    return 'jwt';
  }

  // Simple verification tokens are usually UUIDs or random strings
  // They're typically 32-64 characters long and may contain hyphens
  if (token.length >= 16 && token.length <= 128) {
    return 'verification';
  }

  return 'invalid';
};

/**
 * Log token information for debugging purposes
 * Only logs safe information (type and length), never the actual token
 * 
 * @param token - The token to log information about
 * @param context - Context string for the log message
 */
export const logTokenInfo = (token: string, context: string = 'Token'): void => {
  const type = getTokenType(token);
  const length = token?.length || 0;
  const preview = token ? `${token.substring(0, 8)}...` : 'null';
  
  console.log(`${context} - Type: ${type}, Length: ${length}, Preview: ${preview}`);
};