# Connect Consent - Purpose and System Improvement

## Current System Flow

### Regular User Signup
1. User signs up → Accepts Privacy Policy → Account created
2. User wants to apply → Must accept Application Consent
3. User can browse jobs, but cannot apply without Application Consent

### Admin-Created Users (Sourcing)
1. Admin manually adds candidate → User created with NO consent
2. **PROBLEM**: No legal basis to contact/store data for sourced candidates
3. **GDPR RISK**: Storing personal data without explicit consent

## Connect Consent Purpose

### Primary Use Case: Admin-Sourced Candidates
**Scenario**: Admin finds candidate on LinkedIn, adds them to system
- **Current**: User created, but no consent = GDPR violation risk
- **With Connect Consent**: Admin can request Connect consent before/after adding
- **Benefit**: Legal basis to store and contact sourced candidates

### Secondary Use Case: Talent Pool Distinction
**Scenario**: User signs up but doesn't want to apply yet
- **Current**: User in system, but unclear if they want to be contacted
- **With Connect Consent**: Clear distinction:
  - **Application Consent** = "I want to apply to jobs"
  - **Connect Consent** = "I want to be in talent pool for future opportunities"
- **Benefit**: Better segmentation and GDPR compliance

## Improved System Design

### Option 1: Connect Consent for Admin-Created Users (Recommended)
```
Admin creates user → System requires Connect Consent
→ Admin sends invitation email with Connect consent link
→ User accepts → Can be contacted/stored legally
```

### Option 2: Connect Consent as Optional Talent Pool
```
User signs up → Can browse jobs
→ Optional: "Join Talent Pool" → Accept Connect Consent
→ Company can proactively reach out
```

### Option 3: Connect Consent for LinkedIn OAuth Users
```
User signs up via LinkedIn → Auto-accepts Privacy Policy
→ If they don't apply immediately → Need Connect Consent to store/contact
→ Prevents storing data without purpose
```

## Recommendation

**Implement Connect Consent for:**
1. ✅ **Admin-created users** (mandatory) - GDPR compliance for sourcing
2. ✅ **Optional talent pool** - Users who want proactive outreach
3. ✅ **LinkedIn OAuth users** - Who sign up but don't apply immediately

**Don't require for:**
- ❌ Regular signups (they'll give Application Consent when applying)
- ❌ Users who already applied (Application Consent covers them)

## Implementation Strategy

### Backend Changes
1. When admin creates user → Set `connectConsentGiven = false`
2. Send invitation email with Connect consent link
3. User accepts → Set `connectConsentGiven = true`
4. Validate Connect Consent before:
   - Adding to bulk email campaigns
   - Sourcing/referral workflows
   - Proactive outreach

### Frontend Changes
1. Profile Settings: Add Connect Consent section (optional for regular users)
2. Admin User Creation: Add Connect Consent checkbox/requirement
3. Invitation Email: Include Connect consent acceptance link

## Benefits

1. **GDPR Compliance**: Legal basis for storing sourced candidates
2. **Clear Segmentation**: Distinguish applicants vs talent pool
3. **Better Data Management**: Know who can be contacted and why
4. **Reduced Risk**: No storing data without explicit consent

