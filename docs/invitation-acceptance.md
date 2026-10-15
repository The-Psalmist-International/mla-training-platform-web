# Invitation acceptance

Both apps register `/accept-invitation`. Existing emails addressed to the staff origin remain supported; no replacement invitation is required just because a link points to port 5000.

The token remains in the browser fragment until acceptance. The shared form collects a full name, password, and confirmation, clears any previous in-memory account, and calls the existing `acceptInvitation` mutation. The API remains authoritative for the invited email and role, expiry, revocation, and single use. The form never exposes a role selector or persists a password/token in browser storage.

On success, the fragment and form secrets are cleared. Accounts matching the current app are established directly in its in-memory session. Cross-app handoff uses `/auth/callback?status=success` and the API's HttpOnly refresh cookie; neither the invitation token nor the access token is transferred in an application URL. Both callback routes are registered.

## Public frontend settings

- Staff app: `VITE_LEARNER_URL` is the learner application's origin.
- Learner app: `VITE_WORKSPACE_URL` is the staff application's origin.
- Defaults in development are `http://localhost:5001` and `http://localhost:5000` respectively. Production must set these explicitly to the appropriate HTTPS origins, without paths, query strings, credentials, or fragments.
- The API's CORS origins and cookie same-site/secure configuration must support both apps, as with the existing Google callback flow.

Missing/malformed links and expired/revoked/used invitations show recovery instructions. A failed automatic sign-in after successful account creation does not resubmit or consume the invitation again; the account-created state offers sign-in instead.

Verification uses generated test tokens only. Never consume a token supplied in a support conversation to test the flow.
