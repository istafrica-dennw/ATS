# Privacy System Integration Analysis

## Current Implementation (Working)

### Backend
1. **User Model** (`User.java`):
   - `privacyPolicyAccepted` (Boolean) - General privacy policy acceptance
   - `privacyPolicyAcceptedAt` (LocalDateTime) - When it was accepted

2. **Application Submission** (`ApplicationServiceImpl.java`):
   - **Line 103**: Checks `candidate.getPrivacyPolicyAccepted()` 
   - **Error if false**: "You must accept the Privacy Policy to apply for jobs"

3. **Endpoints**:
   - `POST /api/auth/accept-privacy-policy` - Accept general privacy policy
   - `POST /api/auth/register` - Requires `privacyPolicyAccepted: true` in request

4. **OAuth Signup** (`CustomOAuth2AuthenticationSuccessHandler.java`):
   - Line 169: Auto-accepts privacy policy for LinkedIn users

### Frontend
1. **JobApplicationForm** (`JobApplicationForm.tsx`):
   - Line 58: Checks `user?.privacyPolicyAccepted === true`
   - Line 350: Blocks application if not accepted
   - Shows message: "Privacy Policy acceptance required"

2. **ProfileSettingsPage** (`ProfileSettingsPage.tsx`):
   - Shows privacy policy acceptance status
   - Button to accept via `/api/auth/accept-privacy-policy`

3. **SignupForm** (`SignupForm.tsx`):
   - Requires checkbox for privacy policy acceptance

## New System (To Be Implemented)

### Database Schema (V38 migration)
- Adds granular consent fields:
  - `application_consent_given` - Specific consent for job applications
  - `future_jobs_consent_given` - Consent for future job opportunities
  - `connect_consent_given` - Consent for Connect feature
- Adds `privacy_settings` table for admin-configurable terms
- Adds `privacy_consent_logs` for audit trail
- Adds `candidate_data_requests` for GDPR requests

## Integration Strategy (No Conflicts)

### Phase 1: Coexistence
1. **Keep `privacyPolicyAccepted`** as general requirement (backward compatibility)
2. **Add granular permissions** as additional requirements
3. **Application submission** will check BOTH:
   ```java
   // Current check (keep)
   if (!candidate.getPrivacyPolicyAccepted()) {
       throw new BadRequestException("Privacy Policy must be accepted");
   }
   
   // New check (add)
   if (!candidate.getApplicationConsentGiven()) {
       throw new BadRequestException("Application consent must be given");
   }
   ```

### Phase 2: Migration Path
1. **Existing users** with `privacyPolicyAccepted=true`:
   - Can still use the system
   - Will be prompted to give application consent on next application
   - No breaking changes

2. **New users**:
   - Accept general privacy policy during signup (existing flow)
   - Accept application consent during first job application (new flow)

3. **Application Form**:
   - Show checkbox with customizable terms from `privacy_settings` table
   - Terms can include placeholders: `{privacy-policy}`, `{company-name}`
   - Mandatory checkbox for application consent
   - Optional checkbox for future jobs consent

### Phase 3: Backend Changes Required

1. **ApplicationServiceImpl.java**:
   ```java
   // Update validation to check both
   if (!candidate.getPrivacyPolicyAccepted()) {
       throw new BadRequestException("Privacy Policy must be accepted");
   }
   if (!candidate.getApplicationConsentGiven()) {
       throw new BadRequestException("Application consent must be given");
   }
   ```

2. **New Endpoint**: `POST /api/applications/{jobId}/submit`
   - Accept `ApplicationConsentRequest` DTO
   - Record consents in `privacy_consent_logs`
   - Update user's consent fields

3. **PrivacySettingsService**:
   - Get customizable terms from database
   - Replace placeholders with actual values
   - Return terms for frontend display

## Compatibility Matrix

| User State | Can Apply? | Action Required |
|------------|------------|-----------------|
| `privacyPolicyAccepted=false` | ❌ No | Accept general privacy policy |
| `privacyPolicyAccepted=true`, `applicationConsentGiven=false` | ❌ No | Accept application consent |
| `privacyPolicyAccepted=true`, `applicationConsentGiven=true` | ✅ Yes | None |

## Frontend Changes Required

1. **JobApplicationForm.tsx**:
   - Add consent checkboxes before submission
   - Fetch terms from `/api/privacy-settings/application-terms`
   - Show mandatory checkbox for application consent
   - Show optional checkbox for future jobs
   - Submit consents with application

2. **ProfileSettingsPage.tsx**:
   - Show granular consent status
   - Allow withdrawal of future jobs consent
   - Keep existing privacy policy acceptance section

## No Breaking Changes

✅ **Existing users**: Continue to work, will be prompted for new consents
✅ **Existing API**: `/api/auth/accept-privacy-policy` still works
✅ **Database**: New columns are nullable, defaults to false
✅ **Frontend**: Existing checks remain, new checks added

## Migration Notes

- Migration V38 uses `TIMESTAMP WITH TIME ZONE` but User model uses `LocalDateTime`
- **Action**: Update User model to use `ZonedDateTime` for new fields OR update migration to use `TIMESTAMP`
- Recommendation: Use `ZonedDateTime` for consistency with audit fields

