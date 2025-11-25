# Connect Consent Flow for Admin-Created Users

## Current Problem

When admin creates a user account:
1. ✅ User account is created
2. ✅ Verification email sent (optional)
3. ❌ **NO CONSENT COLLECTED** → GDPR violation risk
4. ❌ System stores personal data without legal basis

## Proposed Flow with Connect Consent

### Step 1: Admin Creates User
```
Admin fills AddUserModal form
→ Clicks "Create User"
→ Backend creates user with:
   - connectConsentGiven = false (default)
   - privacyPolicyAccepted = false (for admin-created users)
   - isActive = true
```

### Step 2: System Sends Invitation Email
```
Backend sends invitation email containing:
1. Welcome message
2. Email verification link (if enabled)
3. **Connect Consent link** (NEW)
   - Link: /accept-connect-consent?token=XXX
   - Explains: "We'd like to add you to our talent pool"
```

### Step 3: User Receives Email
```
User receives email with two links:
1. "Verify Email" → Standard verification
2. "Accept Connect Consent" → NEW consent acceptance
```

### Step 4: User Accepts Connect Consent
```
User clicks "Accept Connect Consent" link
→ Redirected to Connect Consent page
→ Sees terms: "I confirm that IST stores my personal details..."
→ Clicks "Accept"
→ Backend sets:
   - connectConsentGiven = true
   - connectConsentGivenAt = now()
   - Logs consent in privacy_consent_logs
```

### Step 5: Legal Basis Established
```
✅ User has given explicit consent
✅ System can legally:
   - Store their personal data
   - Contact them about opportunities
   - Add them to talent pool
   - Include in bulk emails (if they consent)
```

## Why This Is Needed

### GDPR Requirement
**Article 6(1)(a) GDPR**: Processing is lawful only if:
- Data subject has given **consent** to processing
- Consent must be **freely given, specific, informed, unambiguous**

### Current Violation
When admin creates user without consent:
- ❌ No legal basis for processing
- ❌ Personal data stored without permission
- ❌ Cannot contact them legally
- ❌ Risk of GDPR fines

### With Connect Consent
- ✅ Explicit consent obtained
- ✅ Legal basis established
- ✅ Can store and process data
- ✅ Can contact about opportunities
- ✅ GDPR compliant

## Implementation Details

### Backend Changes Needed

1. **UserServiceImpl.createUser()**:
   ```java
   // For admin-created users (role = CANDIDATE)
   if (userDTO.getRole() == Role.CANDIDATE && userDTO.getCreatedByAdmin()) {
       user.setPrivacyPolicyAccepted(false); // User must accept
       user.setConnectConsentGiven(false);   // User must accept
       // Generate Connect consent token
       String connectConsentToken = TokenUtil.generateConnectConsentToken(user);
       user.setConnectConsentToken(connectConsentToken);
   }
   ```

2. **Email Service**:
   ```java
   // Send invitation email with Connect consent link
   sendAdminCreatedUserInvitation(user, connectConsentToken);
   ```

3. **New Endpoint**:
   ```java
   POST /api/auth/accept-connect-consent?token=XXX
   → Validates token
   → Sets connectConsentGiven = true
   → Logs consent
   ```

### Frontend Changes Needed

1. **Connect Consent Acceptance Page**:
   - New page: `/accept-connect-consent?token=XXX`
   - Shows Connect consent terms
   - "Accept" button
   - Links to privacy policy

2. **Email Template Update**:
   - Add Connect consent link to invitation email
   - Clear explanation of what they're consenting to

## Alternative: Admin Collects Consent First

**Option B**: Admin collects consent before creating account
- Admin asks candidate: "Can we add you to our system?"
- Candidate says yes → Admin creates account with `connectConsentGiven = true`
- Still need to send confirmation email with terms

**Problem**: Hard to prove consent was given (no audit trail)

**Better**: Use email link approach (Option A) - creates audit trail

## Benefits

1. **GDPR Compliance**: Legal basis for processing
2. **Audit Trail**: Consent logged with IP, timestamp, user agent
3. **Transparency**: User knows exactly what they're consenting to
4. **Flexibility**: User can withdraw consent later
5. **Risk Reduction**: No storing data without explicit consent

