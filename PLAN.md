# PLAN

## Context

- Backend already exposes the core APIs for password reset, email confirmation, invite join, and message update/delete.
- The generated frontend client already contains mutations for those APIs, so most of the missing work is UI flow, state wiring, and a few backend alignment fixes.
- The biggest auth gap is that backend email templates currently point to `FRONTEND_URL/auth/...`, while the frontend router exposes public auth pages at flat paths like `/login`, `/register`, and `/recovery`.
- The biggest chat gap is that realtime create is implemented, but realtime update/delete is only partially scaffolded.

## Recommended Order

1. Account recovery and email confirmation
2. Invite-by-link onboarding
3. Message edit/delete

## 1. Account Recovery And Email Confirmation

### Goal

Finish the full lost-password and confirm-email journey so users can recover access and verify email without dead ends.

### Scope

1. Replace the `/recovery` placeholder with a real request-reset flow.
2. Add a tokenized reset-password page.
3. Add a tokenized confirm-email page.
4. Add a resend-confirmation path for unconfirmed users.
5. Add copy for all new states in `en-US`, `ru-RU`, and `uk-UA` locales.

### Backend Work

1. Align email URLs in `backend/src/modules/auth/auth.service.ts`.
2. Preferred option: keep frontend public URLs flat and update mail templates to point to `/reset-password?token=...` and `/confirm-email?token=...`.
3. Keep current API contracts if possible.
4. The generated client already includes `postAuthRequestResetMutation`, `postAuthResetPasswordTokenMutation`, `postAuthConfirmEmailTokenMutation`, and `postAuthConfirmEmailResendMutation`, so no OpenAPI/client regeneration is needed unless payload or response shapes change.

### Frontend Work

1. Replace `frontend/src/app/routes/(auth)/recovery/index.tsx` with a real request-reset screen.
2. Add a `useRecoveryPage`-style hook that uses TanStack Form and `postAuthRequestResetMutation`.
3. Show a neutral success state after submit so the UI does not leak whether the email exists.
4. Add `frontend/src/app/routes/(auth)/reset-password/index.tsx`.
5. Validate the `token` search param with zod, collect `newPassword` and `confirmPassword`, call `postAuthResetPasswordTokenMutation`, and redirect to `/login` on success.
6. Add `frontend/src/app/routes/(auth)/confirm-email/index.tsx`.
7. Read the `token` search param, confirm on load or behind an explicit CTA, and handle invalid or expired token states cleanly.
8. Add a resend-confirmation form using `postAuthConfirmEmailResendMutation`.
9. Optionally surface the same resend CTA inside profile or settings when `context.user.emailConfirmed === false` so users can recover the flow later.
10. Add all new locale keys under `frontend/src/assets/locales/*.json`.

### Decisions And Risks

1. The current URL mismatch is the main blocker.
2. Backend emails currently link to nonexistent frontend routes under `/auth/...`.
3. Request-reset and resend-confirmation UX must stay generic because backend intentionally avoids email enumeration.

### Acceptance Criteria

1. `/recovery` submits a reset request and shows a non-enumerating success state.
2. A valid reset link opens the app, accepts a new password, and returns the user to sign-in.
3. A valid confirmation link opens the app and updates the user to `emailConfirmed: true`.
4. Unconfirmed users have a visible way to resend the confirmation email.
5. All new UI copy exists in English, Russian, and Ukrainian.

### Validation

1. `bun run lint`
2. `bun run test:unit`
3. `bun run test:it`
4. `bun run build:dev`

## 2. Invite-By-Link Onboarding

### Goal

Let a user open a shareable invitation URL and land in the target community with minimal friction.

### Scope

1. Public invite landing route.
2. Login redirect preservation for invite flows.
3. Auto-join and redirect into the community.
4. Better already-member handling.
5. Full invite URL exposure in owner-facing invitation UI.

### Backend Work

1. Keep using `POST /communities/join/:token` as the main join action.
2. Make the join action idempotent for already-joined users.
3. Today `backend/src/modules/invitations/invitations.service.ts` throws `ALREADY_A_MEMBER`, which blocks a clean deep-link experience because the client does not receive the target `communityId`.
4. Preferred change: when membership already exists, return the community instead of throwing.
5. No OpenAPI/client regeneration is needed if the response shape stays `{ community }`.
6. If a new lookup endpoint or extra fields are added, regenerate `frontend/api/`.

### Frontend Work

1. Add a public route like `frontend/src/app/routes/invite/$token.tsx`.
2. Validate the token with zod and render loading, success, and error states.
3. When the user is authenticated, call `postCommunitiesJoinTokenMutation`, invalidate joined communities, and redirect to `/c/$communityId`.
4. Preserve destination through auth.
5. Update `frontend/src/app/routes/(layout)/_layout.tsx` so unauthenticated access redirects to `/login?redirectTo=/invite/<token>` instead of dropping the user at the root.
6. Update login and register hooks to honor `redirectTo` after successful auth.
7. Keep Google OAuth out of the critical path unless we explicitly add `state` support, because the current callback always redirects to `FRONTEND_URL`.
8. Update invitation creation and viewing UI to show the full shareable invite URL, while keeping the raw token available as a fallback.

### Decisions And Risks

1. Invite deep-link resume depends on redirect state being preserved through auth.
2. Already-member behavior needs a backend decision; otherwise the invite page cannot redirect those users to the existing community reliably.
3. Google OAuth resume is a follow-up unless we add explicit state handling.

### Acceptance Criteria

1. Opening `/invite/<token>` while logged out sends the user through login and returns them to the same invite.
2. Opening a valid invite while logged in joins the community and redirects to `/c/<communityId>`.
3. Opening an invite for a community the user already joined still lands them in that community.
4. Owners can copy a full invite URL directly from the invitation UI.

### Validation

1. `bun run lint`
2. `bun run test:it`
3. `bun run build:dev`

## 3. Message Edit/Delete

### Goal

Let users manage their own sent messages and keep all open clients in sync.

### Scope

1. Edit own messages.
2. Delete own messages.
3. Realtime propagation of edits and deletes.
4. Minimal hover or dropdown actions in the chat UI.

### Backend Work

1. Reuse the existing HTTP endpoints in `backend/src/modules/messages/messages.router.ts`.
2. `PATCH /messages/:messageId` and `DELETE /messages/:messageId` already exist and should remain the source of truth for authorization.
3. Finish realtime support in the websocket layer.
4. The websocket package already defines `UPDATE_MESSAGE`, `DELETE_MESSAGE`, `UpdatedMessageResponse`, `DeletedMessageResponse`, and request schemas, but `backend/src/modules/websocket/websocket.service.ts` currently handles only `CREATE_MESSAGE`.
5. Extract a shared channel broadcaster service.
6. Right now live connections are owned by `WebsocketService`, so HTTP edit/delete handlers cannot publish updates.
7. Move channel connection registry and broadcast logic into a reusable service that can be injected into both `MessagesRouter` and `WebsocketRouter` from `backend/src/app/create-app.ts`.
8. After a successful HTTP edit or delete, broadcast `UpdatedMessageResponse` or `DeletedMessageResponse` to the channel.

### Frontend Work

1. Extend the chat view model in `frontend/src/app/routes/(layout)/_layout/c/$communityId/_layout/$channelId/-components/channel-chat/hooks/useChannelChat/useChannelChat.ts` and `session.store.ts`.
2. Expose `serverId`, `userId`, `isOwnMessage`, and `isEdited` so the UI can target the correct message and mark edited content.
3. Add store helpers to update a message in place and remove a deleted message.
4. Do not expose edit/delete actions on optimistic rows that do not have a stable server id yet.
5. Add message actions to `channel-chat.tsx` for the current user’s sent messages only.
6. Start with inline edit and delete-confirm flows to keep the first iteration small.
7. Wire REST mutations with local reconciliation using `patchMessagesMessageIdMutation` and `deleteMessagesMessageIdMutation`.
8. Handle `UPDATE_MESSAGE` and `DELETE_MESSAGE` in `useChannelChatWebsocket.ts` so other connected clients update immediately.

### Decisions And Risks

1. The core architecture gap is broadcast ownership between HTTP mutations and the websocket connection registry.
2. MVP delete can fully remove the row instead of rendering a tombstone.
3. Edit/delete should stay unavailable for pending and failed optimistic messages.

### Acceptance Criteria

1. A user can edit their own sent message and see the updated content immediately.
2. A user can delete their own sent message and see it disappear immediately.
3. Another client connected to the same channel sees edits and deletes without reload.
4. Users cannot edit or delete someone else’s message.
5. Pending or failed messages do not expose edit/delete controls.

### Validation

1. `bun run lint`
2. `bun run test:it`
3. `bun run build:dev`

## Notes

1. Feature 1 and feature 2 can share the same public-route and `redirectTo` patterns.
2. Feature 3 does not require OpenAPI regeneration unless HTTP contracts change.
3. If scope needs to stay tight, implement in the order above and treat Google OAuth invite resume as a follow-up.
