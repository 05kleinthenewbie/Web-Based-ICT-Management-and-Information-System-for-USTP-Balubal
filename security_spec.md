# Security Specification - USTP ICT Management System

## Data Invariants
1. **User Profiles**: Every user must have a profile in the `users` collection with a valid role (`student`, `faculty`, `admin`).
2. **Service Requests**: Users can only create and read their own requests unless they are admins.
3. **Inventory**: Only admins can modify inventory. All authenticated users can read.
4. **Bookings**: Users can only modify their own pending bookings. Admins can manage all.
5. **Incidents**: Only admins can create and resolve incidents. All authenticated users can read (for transparency/transcripts).

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: Attempt to create a `user` document with a different UID than the authenticated user.
2. **Privilege Escalation**: Attempt to update own `role` to `admin` in `users` collection.
3. **Shadow Field Injection**: Attempt to create an `inventory` item with a hidden `priorityAccess` field not in schema.
4. **Orphaned Request**: Attempt to create a `request` with a `userId` that doesn't match `request.auth.uid`.
5. **State Skipping**: Attempt to create a `request` with status `completed`.
6. **Immutable Field Tampering**: Attempt to update `createdAt` on any document.
7. **Cross-User Leak**: Non-admin user attempting to list all `requests` without a `userId` filter.
8. **Malicious ID**: Attempt to create a document with a 2KB junk string as the ID.
9. **Negative Liability**: Attempt to create an `incident` with a negative `amount`.
10. **Unauthorized Inventory Write**: Non-admin attempting to delete an inventory item.
11. **Spoofed Timestamp**: Attempt to set a `createdAt` in the future or past, rather than `request.time`.
12. **Anonymous Access**: Unauthenticated user attempting to read any collection.

## Test Strategy
- Verify `PERMISSION_DENIED` for all Dirty Dozen payloads.
- Verify `isOwner()` and `isAdmin()` logic gates.
- Verify `isValidId()` and `isValid[Entity]()` helpers.
