# Learner signup and private learning content

Learners can create accounts at `/sign-up` without an invitation. Email/password signup sends a one-hour verification link; it does not sign the learner in. `/verify-email` requires an explicit verification action, then establishes the in-memory session. Learners can request a replacement link from either confirmation or verification screen. Only the newest link works. Google signup uses Google's verified email claim; staff signup remains invitation-controlled.

In Orchestrator, the owning instructor or an administrator can:

- Open **Course → Settings → Course and lesson access** to make a draft/published course private or public.
- Open **Course → Learners → Assign learner** and enter the learner's registered email. Assignment requires a published course and an existing learner account. It also upgrades a prior self-enrollment without replacing progress.
- Choose a lesson in Settings, mark it private, and grant/revoke access for enrolled learners using the paginated, searchable access table. Selected lesson, search, page and page size are URL-backed.

Private courses require staff enrollment and are hidden from other learners. Private lessons inside public courses require individual grants even for staff-enrolled learners. Locked lessons display an access-required notice; required locked lessons still count toward completion. In private courses, staff enrollment covers all course lessons. Existing completions/certificates retain their historical status.

The API enforces these rules for content, progress, assessments, uploads, history and playback. Client-side hiding is not the security boundary. The learner player periodically refreshes course state/content to reflect grant changes; content already delivered cannot be recalled.

## Rollout

Deploy the linked backend changes and migration `0014_verified-signup-private-access.sql` first. Keep the existing Resend email worker running, and allow the learner origin in backend `CORS_ORIGINS` so email links point back to the learner app. No new frontend secrets are required. Existing courses default to public: review restricted published courses during rollout before exposing public signup.

Tokens remain memory-only. The shared session controller renews access credentials using the HttpOnly refresh cookie, preserving private caches during same-user renewal and keeping identity during temporary outages. Confirmed refresh rejection or explicit logout clears local credentials and caches.
