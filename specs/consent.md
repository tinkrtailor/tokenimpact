# Cookie Consent Specification

GDPR/privacy compliance for Token Impact.

## Requirements

### Legal

- GDPR (EU): Consent before non-essential cookies
- CCPA (California): Notice + opt-out for data sales
- ePrivacy: Consent for tracking cookies

### Our Situation

Token Impact has minimal cookie/tracking needs:
- Vercel Analytics: Cookie-less (no consent needed)
- Affiliate tracking: Session-based redirect (no cookie)
- No user accounts
- No personalization

**Cookies we MAY use:**
- Affiliate attribution (if needed for longer windows)
- Future: Recently used symbols preference
- Future: Theme preference

## Strategy

### MVP Approach

**No consent banner needed** if we:
1. Use Vercel Analytics (cookie-less)
2. Track affiliate clicks server-side via redirect
3. Don't store user preferences

This is the recommended MVP approach.

### Future Approach (if cookies added)

If we add cookies for preferences or extended tracking:

## Consent Banner Design

### Appearance

```
┌────────────────────────────────────────────────────────────┐
│ We use cookies to remember your preferences and track      │
│ affiliate referrals. [Accept] [Decline] [Learn More]       │
└────────────────────────────────────────────────────────────┘
```

- Fixed to bottom of screen
- Subtle but visible
- Doesn't block content
- Dismissable

### Mobile

```
┌─────────────────────────┐
│ We use cookies for      │
│ preferences & affiliate │
│ tracking.               │
│                         │
│ [Accept] [Decline]      │
│ [Privacy Policy]        │
└─────────────────────────┘
```

### Timing

- Show on first visit
- Don't show again after choice made
- Store consent in localStorage (not a cookie, ironically)

## Consent States

| State | Behavior |
|-------|----------|
| Not yet decided | Show banner, essential only |
| Accepted | All cookies enabled |
| Declined | Essential only, no tracking cookies |

## What's Affected by Consent

| Feature | Consent Required | Fallback |
|---------|------------------|----------|
| Vercel Analytics | No (cookie-less) | N/A |
| Affiliate redirect tracking | No (server-side) | N/A |
| Recently used symbols | Yes | Don't persist |
| Theme preference | Yes | Use system default |
| Extended affiliate cookie | Yes | Session only |

## Implementation

### Consent Storage

```typescript
// localStorage key
const CONSENT_KEY = 'cookie_consent';

type ConsentState = 'accepted' | 'declined' | null;

function getConsent(): ConsentState {
  return localStorage.getItem(CONSENT_KEY) as ConsentState;
}

function setConsent(state: 'accepted' | 'declined') {
  localStorage.setItem(CONSENT_KEY, state);
}
```

### Conditional Cookie Setting

```typescript
function setPreferenceCookie(key: string, value: string) {
  if (getConsent() === 'accepted') {
    document.cookie = `${key}=${value}; max-age=31536000; path=/`;
  }
}
```

### Banner Component

```typescript
function ConsentBanner() {
  const [consent, setConsentState] = useState(getConsent());

  if (consent !== null) return null;

  return (
    <div className="fixed bottom-0 ...">
      <p>We use cookies for preferences & affiliate tracking.</p>
      <button onClick={() => { setConsent('accepted'); setConsentState('accepted'); }}>
        Accept
      </button>
      <button onClick={() => { setConsent('declined'); setConsentState('declined'); }}>
        Decline
      </button>
      <a href="/privacy">Privacy Policy</a>
    </div>
  );
}
```

## Privacy Policy Requirements

Must include:
- What data we collect
- Why we collect it
- How long we keep it
- Third parties (exchanges, analytics)
- User rights (access, deletion)
- Contact information

### Privacy Policy Outline

```markdown
# Privacy Policy

## What We Collect
- Anonymous usage analytics (page views, events)
- Affiliate click tracking (which exchange, what trade)
- Optional: Cookie for preferences (with consent)

## What We Don't Collect
- Personal information
- Account data (we don't have accounts)
- Trading history
- Wallet addresses

## Third Parties
- Vercel: Hosting and analytics
- Exchanges: Affiliate links redirect to their sites

## Your Rights
- Access your data: Contact us
- Delete your data: Clear browser storage
- Opt out: Decline cookies, use Do Not Track

## Contact
[email address]

## Updates
Last updated: [date]
```

## Do Not Track

Respect DNT header (optional but good practice):

```typescript
function shouldTrack(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.doNotTrack !== '1';
  }
  return true;
}
```

## Affiliate Disclosure

Separate from cookies but required:

### Footer Text
"We earn commission from partner links at no extra cost to you."

### Disclosure Page
Link to `/disclosure` or section in `/about` explaining affiliate relationship.

## Testing Checklist

- [ ] Banner appears on first visit
- [ ] Banner doesn't appear after accept/decline
- [ ] Declining prevents preference cookies
- [ ] Accepting enables preference cookies
- [ ] Privacy policy link works
- [ ] Banner doesn't block content
- [ ] Mobile layout works
- [ ] Keyboard accessible
- [ ] Screen reader announces banner
