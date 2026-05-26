# Security Specification

This document defines the security boundaries, data invariants, and defensive tests for the Firestore rules of Integlis CRM.

## 1. Data Invariants

- **Identity Ownership**: No user can read, list, update, or delete any document (Clients, Deals, Quotes, Docs, Tasks, Trash) unless the document's `ownerId` matches the authenticated user's `uid`.
- **Relational Integrity**: Clients and sub-records must have a valid `id` formatted matches alphanumeric/dash patterns.
- **Strict Keys**: Document creations must contain exactly the schema-required fields and no ghost/shadow keys.
- **Immunization**: `ownerId` and `id` must be immutable once created.

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to breach security lines and must always return `PERMISSION_DENIED`:

1. **Identity Spoofing - External Owner**: Creating a client with `ownerId` set to a different user's ID.
2. **PII Direct Leak**: Reading profile data without owner verification.
3. **Ghost Key Injection**: Saving a client with extra/unregistered fields (e.g., `isAdmin: true` or `verified: true`).
4. **Id Poisoning**: Using a 1MB string or high-byte special-character sequence as the document ID path.
5. **No-auth Create**: Writing a document without a valid Firebase auth token.
6. **Anonymous User Write**: Writing standard records when logged in anonymously (must require verified emails/regular auth if standard is enforced).
7. **Bypassing Owner in List**: Running a collection query without filtering on `ownerId == auth.uid`.
8. **Owner Reassignment (Update)**: Updating an existing project's `ownerId` to someone else to hijacking permissions.
9. **Creation Timestamp Spoofing**: Setting future or custom client-side values for `createdAt` instead of `request.time`.
10. **State Shortcutting**: Updating closed or terminal status transitions, or setting status without validation.
11. **Negative values for payments**: Saving a service or document with negative amounts / payment fields.
12. **Cascade Deletion Spoof**: Writing trash restoration records targeting other users' data.

## 3. Test Cases (TDD Blueprint)

Verification blocks inside standard emulator rules-test:
- `get` / `list` as unauthenticated status -> `PERMISSION_DENIED`
- `get` as authentic user on other user's records -> `PERMISSION_DENIED`
- `create` with invalid schemas / extra fields -> `PERMISSION_DENIED`
