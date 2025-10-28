# Authentication & Security Documentation

## Overview

Privacy Social uses email-based authentication with Supabase, combined with end-to-end encryption for maximum privacy. This document describes the authentication system, security features, and implementation details.

## Key Features

- **Email/Password Authentication** - Secure, standard authentication method
- **Nickname System** - Unique, user-friendly display names with availability checking
- **JWT Token Management** - Automatic token refresh and rotation
- **Rate Limiting** - Protection against brute force attacks
- **E2E Encryption** - Signal Protocol-inspired encryption for messages
- **Secure Storage** - React Native Keychain for sensitive data
- **Session Management** - Persistent sessions with automatic refresh

## Architecture

```
┌─────────────────┐
│   User Device   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Authentication Flow            │
│  - Email/Password               │
│  - Nickname Validation          │
│  - Rate Limit Check             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Supabase Auth                  │
│  - JWT Token Generation         │
│  - User Management              │
└────────┬────────────────────────┘
         │
         ├───────────────┬──────────────┐
         ▼               ▼              ▼
┌──────────────┐  ┌─────────────┐  ┌─────────────┐
│   Database   │  │   Keychain  │  │ Encryption  │
│  (Profiles)  │  │  (Tokens)   │  │   (Keys)    │
└──────────────┘  └─────────────┘  └─────────────┘
```

## Email Authentication

### Registration Flow

1. **User Input**: Email, password, nickname, username
2. **Validation**:
   - Email format validation
   - Password strength check (min 8 chars)
   - Nickname availability (case-insensitive)
   - Username uniqueness
3. **Rate Limit Check**: Max 3 registration attempts per hour per email
4. **Supabase Auth**: Create auth user
5. **Profile Creation**: Create user profile in database
6. **Nickname Reservation**: Reserve nickname in nicknames table
7. **Encryption Init**: Generate E2E encryption keys
8. **Token Storage**: Store access/refresh tokens in Keychain
9. **Success**: User is logged in

### Login Flow

1. **User Input**: Email, password
2. **Rate Limit Check**: Max 5 login attempts per hour per email
3. **Supabase Auth**: Authenticate credentials
4. **Load Profile**: Fetch user profile from database
5. **Update Activity**: Update `last_active_at` timestamp
6. **Encryption Init**: Load encryption keys from Keychain
7. **Token Storage**: Store new tokens
8. **Success**: User is logged in

### Password Reset Flow

1. **User Input**: Email address
2. **Rate Limit Check**: Max 3 attempts per hour
3. **Send Email**: Supabase sends password reset email
4. **Reset Link**: User clicks link in email
5. **New Password**: User sets new password
6. **Success**: Password updated

## Nickname System

### Features

- **Uniqueness**: Case-insensitive uniqueness across all users
- **Format Validation**:
  - 2-30 characters
  - Letters, numbers, underscores, hyphens, spaces allowed
  - No reserved words (admin, moderator, system, support, privacy, social)
- **History Tracking**: Previous nicknames are stored (deactivated)
- **Real-time Availability**: Check nickname availability before registration

### Database Schema

```sql
CREATE TABLE nicknames (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    nickname text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz,
    updated_at timestamptz
);
```

### Functions

- `is_nickname_available(text)` - Check if nickname is available
- `reserve_nickname(uuid, text)` - Reserve nickname for user
- `get_user_nickname(uuid)` - Get user's active nickname
- `validate_nickname(text)` - Validate nickname format

## JWT Token Management

### Token Types

1. **Access Token**:
   - Short-lived (1 hour)
   - Used for API requests
   - Stored in React Native Keychain

2. **Refresh Token**:
   - Long-lived (30 days)
   - Used to obtain new access tokens
   - Stored in React Native Keychain
   - Automatically rotated on use

### Automatic Refresh

- Background refresh every 55 minutes
- Refresh before token expiration
- Seamless user experience
- Logout on refresh failure

### Token Storage

All tokens are stored securely in React Native Keychain with:
- `ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY` accessibility
- `SECURITY_LEVEL.SECURE_HARDWARE` security level
- Device-specific encryption

## Rate Limiting

Rate limiting is implemented using Redis cache to prevent abuse:

### Limits

- **Registration**: 3 attempts per hour per email
- **Login**: 5 attempts per hour per email
- **Password Reset**: 3 attempts per hour per email

### Implementation

```typescript
const rateLimitKey = `rate:${email}:login`;
const attempts = await cache.get(rateLimitKey) || 0;

if (attempts >= 5) {
  return { error: 'Too many attempts' };
}

await cache.increment(rateLimitKey);
await cache.expire(rateLimitKey, 3600); // 1 hour
```

### Reset

Rate limits are automatically cleared on:
- Successful authentication
- TTL expiration (1 hour)

## End-to-End Encryption

### Signal Protocol-Inspired

The E2E encryption system is inspired by the Signal Protocol and includes:

1. **Identity Key Pair**: Long-term identity (Ed25519)
2. **Signed Pre Key**: Medium-term key signed by identity key
3. **One-Time Pre Keys**: Single-use keys for forward secrecy
4. **Ephemeral Keys**: Per-message keys

### Key Generation

```typescript
const keys = await encryption.generateKeys();
// Returns:
// - identityKeyPair (public/private)
// - signedPreKey (public/private/signature)
// - oneTimePreKeys (100 keys for forward secrecy)
```

### Message Encryption

```typescript
const encrypted = await encryption.encryptMessage(
  'Hello, World!',
  recipientPublicKey
);
// Returns:
// - ciphertext (encrypted message)
// - ephemeralKey (session key)
// - iv (initialization vector)
// - mac (message authentication code)
```

### Key Management

- Keys stored in React Native Keychain
- Automatic replenishment of one-time pre keys (< 20 remaining)
- Key rotation capability for enhanced security

### Features

- **Forward Secrecy**: Each message uses unique ephemeral keys
- **Authentication**: MAC ensures message integrity
- **Repudiation**: Deniable authentication
- **Key Ratcheting**: Continuous key evolution

## Secure Storage

### React Native Keychain

All sensitive data is stored using React Native Keychain:

```typescript
const secureData = {
  encryptionKeys: { /* encryption keys */ },
  authTokens: { accessToken, refreshToken },
  userPreferences: { /* user settings */ }
};

await secureStorage.setItem('encryptionKeys', keys);
const keys = await secureStorage.getItem('encryptionKeys');
```

### Security Features

- Hardware-backed encryption (when available)
- Biometric protection (optional, future feature)
- Secure enclave storage on iOS
- Keystore system on Android
- Device-specific encryption

### Data Types Stored

1. **Encryption Keys**: E2E encryption key pairs
2. **Auth Tokens**: Access and refresh tokens
3. **User Preferences**: Privacy settings and app preferences

## State Management

### Zustand Store

Authentication state is managed globally with Zustand:

```typescript
const {
  user,
  session,
  isAuthenticated,
  isLoading,
  error,
  register,
  login,
  logout,
  refreshSession
} = useAuthStore();
```

### State Properties

- `user`: Current user profile
- `session`: Authentication session with tokens
- `isAuthenticated`: Boolean authentication status
- `isLoading`: Loading state for async operations
- `error`: Error object for display

### Actions

- `register(data)`: Register new user
- `login(credentials)`: Login existing user
- `logout()`: Logout and clear session
- `refreshSession()`: Refresh access token
- `resetPassword(email)`: Send password reset email
- `updatePassword(password)`: Update user password
- `loadSession()`: Load persisted session on app start

## Usage Examples

### Registration

```typescript
import { useAuthStore } from '@/store/authStore';

const { register, isLoading, error } = useAuthStore();

await register({
  email: 'user@example.com',
  password: 'securePassword123',
  nickname: 'John Doe',
  username: 'johndoe'
});
```

### Login

```typescript
import { useAuthStore } from '@/store/authStore';

const { login, isLoading, error } = useAuthStore();

await login({
  email: 'user@example.com',
  password: 'securePassword123'
});
```

### Check Nickname Availability

```typescript
import { authService } from '@/services/auth';

const available = await authService.isNicknameAvailable('John Doe');
if (!available) {
  console.log('Nickname already taken');
}
```

### Encrypt Message

```typescript
import { encryption } from '@/services/encryption';

await encryption.initialize();

const encrypted = await encryption.encryptMessage(
  'Secret message',
  recipientPublicKey
);
```

## Security Best Practices

1. **Never Log Sensitive Data**: Passwords, tokens, keys never logged
2. **Use HTTPS**: All API communication over HTTPS
3. **Validate Input**: Server-side validation for all inputs
4. **Rate Limiting**: Prevent brute force attacks
5. **Token Rotation**: Regular token refresh and rotation
6. **Encryption**: E2E encryption for all private communications
7. **Secure Storage**: Use Keychain for sensitive data
8. **Session Timeout**: Automatic logout after inactivity (future)
9. **Audit Logging**: Track authentication events in user_actions table

## Error Handling

### Error Codes

- `RATE_LIMIT_EXCEEDED`: Too many attempts
- `NICKNAME_TAKEN`: Nickname already in use
- `USERNAME_TAKEN`: Username already in use
- `AUTH_ERROR`: Authentication failed
- `PROFILE_ERROR`: Profile creation failed
- `USER_NOT_FOUND`: User profile not found
- `REFRESH_ERROR`: Token refresh failed
- `RESET_ERROR`: Password reset failed
- `UPDATE_ERROR`: Password update failed

### User-Friendly Messages

All error codes are mapped to user-friendly messages in the UI:

```typescript
const errorMessages = {
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.',
  NICKNAME_TAKEN: 'This nickname is already taken.',
  // ... more messages
};
```

## Testing

### Unit Tests

Test authentication service methods:

```typescript
describe('AuthService', () => {
  it('should register new user', async () => {
    const result = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      nickname: 'Test User',
      username: 'testuser'
    });

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('session');
  });
});
```

### Integration Tests

Test complete authentication flows:

```typescript
describe('Authentication Flow', () => {
  it('should complete registration and login', async () => {
    // Register
    await register(testData);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Logout
    await logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // Login
    await login(credentials);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
```

## Future Enhancements

1. **Two-Factor Authentication (2FA)**: Email or authenticator app
2. **Social OAuth**: Google, Apple, etc. (optional)
3. **Biometric Authentication**: Face ID / Touch ID for quick login
4. **Session Management UI**: View and revoke active sessions
5. **Account Recovery**: Additional recovery methods
6. **Security Alerts**: Email notifications for suspicious activity
7. **Password Policies**: Configurable password requirements
8. **Account Lockout**: Temporary lockout after failed attempts

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Signal Protocol](https://signal.org/docs/)
- [React Native Keychain](https://github.com/oblador/react-native-keychain)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
