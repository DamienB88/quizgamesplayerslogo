# Mobile App Structure Documentation

## Overview

Privacy Social is built with React Native and Expo, using expo-router for navigation. This document describes the mobile app structure, navigation flow, and component organization.

## Technology Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and SDK
- **Expo Router**: File-based navigation
- **TypeScript**: Type-safe JavaScript
- **Zustand**: State management
- **React Native Keychain**: Secure storage

## Project Structure

```
privacy-social-app/
├── app/                          # Expo Router navigation
│   ├── (auth)/                   # Authentication flow
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── login.tsx            # Login screen
│   │   ├── register.tsx         # Registration screen
│   │   └── reset-password.tsx   # Password reset screen
│   ├── (tabs)/                   # Main app tabs
│   │   ├── _layout.tsx          # Bottom tabs layout
│   │   ├── home.tsx             # Home feed
│   │   ├── groups.tsx           # Groups management
│   │   └── profile.tsx          # User profile
│   ├── (onboarding)/             # Onboarding flow
│   │   ├── _layout.tsx          # Onboarding stack layout
│   │   ├── welcome.tsx          # Welcome screen
│   │   ├── permissions.tsx      # Permissions request
│   │   └── complete.tsx         # Onboarding complete
│   ├── _layout.tsx               # Root layout with auth protection
│   └── index.tsx                 # Entry point / splash screen
│
├── src/
│   ├── components/               # React components
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Button.tsx       # Button component
│   │   │   ├── Input.tsx        # Input component
│   │   │   ├── Card.tsx         # Card component
│   │   │   ├── Loading.tsx      # Loading indicator
│   │   │   └── index.ts         # Barrel export
│   │   ├── ErrorBoundary.tsx    # Error boundary
│   │   └── OfflineIndicator.tsx # Offline banner
│   │
│   ├── services/                 # Business logic services
│   │   ├── auth.ts              # Authentication service
│   │   ├── encryption.ts        # E2E encryption
│   │   ├── secureStorage.ts     # Keychain storage
│   │   ├── cache.ts             # Redis caching
│   │   ├── logger.ts            # Logging service
│   │   ├── permissions.ts       # Native permissions
│   │   ├── photoPicker.ts       # Photo picker
│   │   └── network.ts           # Network monitoring
│   │
│   ├── store/                    # Zustand state stores
│   │   └── authStore.ts         # Authentication state
│   │
│   ├── types/                    # TypeScript types
│   │   └── index.ts             # Type definitions
│   │
│   ├── config/                   # Configuration
│   │   └── supabase.ts          # Supabase client
│   │
│   └── utils/                    # Utility functions
│
├── docs/                         # Documentation
│   ├── AUTHENTICATION.md        # Auth system docs
│   ├── DATABASE_SCHEMA.md       # Database schema
│   └── MOBILE_APP_STRUCTURE.md  # This file
│
├── database/                     # Database migrations
│   └── migrations/              # SQL migration files
│
└── .storybook/                   # Storybook configuration

```

## Navigation Flow

### Authentication Flow

The app uses route groups for organized navigation:

```
app/(auth)/
├── login.tsx
├── register.tsx
└── reset-password.tsx
```

**Features:**
- Email/password authentication
- Nickname validation with real-time availability checking
- Form validation with error messages
- Loading states

### Onboarding Flow

New users go through a three-step onboarding:

```
app/(onboarding)/
├── welcome.tsx       # Introduction to app features
├── permissions.tsx   # Request photo library access
└── complete.tsx      # Finish and mark onboarding complete
```

### Main App (Tabs)

Authenticated users access the main app with bottom tab navigation:

```
app/(tabs)/
├── home.tsx      # Daily photo feed
├── groups.tsx    # Group management
└── profile.tsx   # User profile and settings
```

### Protected Routes

The root `app/_layout.tsx` implements authentication protection:

```typescript
// Routing logic:
// 1. If not authenticated → redirect to login
// 2. If authenticated but onboarding incomplete → redirect to onboarding
// 3. If authenticated and onboarding complete → show main app
```

## Key Components

### UI Components

Located in `src/components/ui/`:

#### Button
```typescript
<Button
  title="Sign In"
  onPress={handleLogin}
  variant="primary"
  size="medium"
  loading={isLoading}
  disabled={isDisabled}
/>
```

Variants: `primary`, `secondary`, `outline`, `danger`, `ghost`
Sizes: `small`, `medium`, `large`

#### Input
```typescript
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  helperText="Enter your email address"
  required
/>
```

#### Card
```typescript
<Card elevated padding={16}>
  {children}
</Card>
```

#### Loading
```typescript
<Loading message="Loading..." size="large" />
```

### Error Boundary

Wrap your app with ErrorBoundary to catch React errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Shows user-friendly error screen with retry button. Displays error details in development mode.

### Offline Indicator

Automatically displays when device is offline:

```typescript
<OfflineIndicator />
```

## Services

### Authentication Service

```typescript
import { authService } from '@/services/auth';

// Register
await authService.register({
  email: 'user@example.com',
  password: 'password123',
  nickname: 'John Doe',
  username: 'johndoe'
});

// Login
await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Check nickname availability
const available = await authService.isNicknameAvailable('John Doe');
```

### Photo Picker Service

```typescript
import { photoPicker } from '@/services/photoPicker';

// Pick from library
const photos = await photoPicker.pickFromLibrary({
  allowsMultipleSelection: true,
  quality: 0.8
});

// Take photo
const photo = await photoPicker.takePhoto({
  allowsEditing: true,
  quality: 0.8
});
```

### Permissions Service

```typescript
import { permissions } from '@/services/permissions';

// Ensure permission (checks, requests, and handles denials)
const granted = await permissions.ensurePermission('photos');

// Check specific permission
const status = await permissions.checkPhotoPermission();

// Request specific permission
const result = await permissions.requestPhotoPermission();
```

### Logger Service

```typescript
import { logger } from '@/services/logger';

logger.debug('Debug message', { data });
logger.info('Info message', { data });
logger.warn('Warning message', { data });
logger.error('Error occurred', error, { data });

// Get all logs
const logs = logger.getLogs();

// Export logs
const logsJson = logger.exportLogs();
```

### Network Service

```typescript
import { network, useNetworkStore } from '@/services/network';

// In component
const { isOffline, isConnected, type } = useNetworkStore();

// Manual refresh
await network.refresh();

// Get current state
const state = await network.getCurrentState();
```

## State Management

### Auth Store

```typescript
import { useAuthStore } from '@/store/authStore';

const {
  user,
  session,
  isAuthenticated,
  isLoading,
  error,
  register,
  login,
  logout,
  refreshSession,
  loadSession
} = useAuthStore();
```

**Features:**
- Automatic session refresh every 55 minutes
- Secure token storage in Keychain
- Persistent sessions
- Error handling

### Network Store

```typescript
import { useNetworkStore } from '@/services/network';

const {
  isConnected,
  isInternetReachable,
  type,
  isOffline
} = useNetworkStore();
```

## Security Features

### Secure Storage

All sensitive data stored in React Native Keychain:
- Authentication tokens (access & refresh)
- Encryption keys
- User preferences

```typescript
import { secureStorage } from '@/services/secureStorage';

// Store data
await secureStorage.setAuthTokens(accessToken, refreshToken);

// Retrieve data
const tokens = await secureStorage.getAuthTokens();

// Clear data
await secureStorage.clearAuthTokens();
```

### E2E Encryption

Signal Protocol-inspired encryption:

```typescript
import { encryption } from '@/services/encryption';

// Initialize (loads or generates keys)
await encryption.initialize();

// Encrypt message
const encrypted = await encryption.encryptMessage(
  'Secret message',
  recipientPublicKey
);

// Decrypt message
const decrypted = await encryption.decryptMessage(
  encrypted,
  senderPublicKey
);
```

## Styling

### Theme Colors

```typescript
const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  danger: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',

  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',

  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',

  border: '#E5E5EA',
  borderLight: '#F0F0F0',
};
```

### Common Patterns

```typescript
// Card with shadow
shadowColor: '#000000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3, // Android

// Input field
backgroundColor: '#F5F5F5',
borderRadius: 8,
padding: 16,
borderWidth: 1,
borderColor: '#E0E0E0',

// Button
backgroundColor: '#007AFF',
borderRadius: 8,
padding: 16,
alignItems: 'center',
```

## Development Workflow

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### Hot Reload

Expo provides fast refresh for immediate feedback during development. Changes to components, styles, and logic are reflected instantly.

### Debugging

- **React Native Debugger**: Full debugging with Redux DevTools
- **Console Logs**: Use `logger` service for structured logging
- **Error Boundary**: Catches and displays React errors
- **Network Inspector**: Monitor API calls in Expo DevTools

## Testing

### Component Testing

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

test('button calls onPress when clicked', () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <Button title="Click me" onPress={onPress} />
  );

  fireEvent.press(getByText('Click me'));
  expect(onPress).toHaveBeenCalled();
});
```

### Integration Testing

```typescript
import { useAuthStore } from '@/store/authStore';

describe('Authentication Flow', () => {
  it('should register and login user', async () => {
    const { register, login } = useAuthStore.getState();

    await register({
      email: 'test@example.com',
      password: 'password123',
      nickname: 'Test User',
      username: 'testuser'
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
```

## Performance Optimization

### Image Optimization

- Use `expo-image` for optimized image loading
- Implement lazy loading for image lists
- Cache images locally

### List Optimization

- Use `FlatList` for long lists with `getItemLayout`
- Implement virtualization with `windowSize`
- Memoize list items with `React.memo`

### Bundle Optimization

- Code splitting with dynamic imports
- Remove unused dependencies
- Enable Hermes engine for faster startup

## Accessibility

### Screen Reader Support

```typescript
<TouchableOpacity
  accessibilityLabel="Login button"
  accessibilityHint="Tap to sign in to your account"
  accessibilityRole="button"
>
  <Text>Login</Text>
</TouchableOpacity>
```

### Keyboard Navigation

- Proper tab order with `tabIndex`
- Focus management with `useRef`
- Keyboard shortcuts for power users

## Platform-Specific Code

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    ...Platform.select({
      ios: { shadowOpacity: 0.3 },
      android: { elevation: 4 },
    }),
  },
});
```

## Future Enhancements

1. **Push Notifications**: Real-time updates when new photos are shared
2. **Biometric Auth**: Face ID / Touch ID for quick login
3. **Dark Mode**: Complete dark theme implementation
4. **Animations**: Smooth transitions with Reanimated
5. **Offline Queue**: Queue actions when offline and sync when online
6. **Background Sync**: Sync data in background using BackgroundFetch
7. **App Widgets**: Home screen widgets for quick access
8. **Share Extension**: Share photos directly from other apps

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
