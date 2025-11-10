# data-model.md

**Feature**: Autenticación por correo (001-email-auth)
**Date**: 2025-11-09

## Entities

### User
- id: uuid (primary)
- email: string (unique, normalized to lowercase)
- password_hash: string
- roles: enum[] (e.g., ["admin","user"])
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp

Indexes:
- unique(email)

Validation rules:
- email must be valid email format
- password minimal length enforced at app level (>= 8 chars)


### PasswordResetRequest
- id: uuid (primary)
- token: string (secure random)
- user_id: uuid (FK -> users.id)
- created_at: timestamp
- expires_at: timestamp
- used_at: timestamp | null
- client_ip: string | null

Business rules:
- token is single-use; used_at set on consumption
- expiry default: 1 hour


### UserInvitation
- id: uuid (primary)
- token: string (secure random)
- inviter_id: uuid (FK -> users.id)
- email: string
- created_at: timestamp
- expires_at: timestamp
- used_at: timestamp | null
- client_ip: string | null

Business rules:
- token is single-use; expiry default: 24 hours
- invitation establishes the new user account on acceptance


## Relationships
- User (1) <- (many) PasswordResetRequest
- User (1) <- (many) UserInvitation (as inviter)

## Migrations
- Create users table
- Create password_reset_requests table
- Create user_invitations table

***
