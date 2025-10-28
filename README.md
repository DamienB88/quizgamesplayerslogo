# PrivacyFirst Social

A privacy-first social media application that combines spontaneous photo sharing with WhatsApp's private group model. Built with React Native and Expo.

## Overview

PrivacyFirst Social is a unique social platform where:
- Random photos from your device are selected daily for sharing in private groups
- Users control whether to auto-publish or review within a 3-hour window
- All content is end-to-end encrypted and expires after 30 days
- No public feeds - only private group sharing
- Full user control over content (edit, delete, moderate)

## Key Features

### Privacy-First Design
- Client-side photo processing and selection
- End-to-end encryption for all communications
- No public feeds or data harvesting
- 30-day automatic content deletion
- EXIF data stripping for privacy protection

### User Control
- Comprehensive onboarding with educational slides
- Choose between auto-publish or 3-hour review mode
- Edit captions and comments anytime
- Delete own photos instantly
- Moderate comments and reactions on your content

### Private Groups
- Create and manage private groups
- Instagram-style feeds with reactions and comments
- Real-time updates via WebSocket
- Group moderation tools

## Tech Stack

### Frontend
- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **Zustand** for state management
- **React Query** for data fetching and caching
- **React Native Reanimated** for smooth animations
- **Lottie** for micro-animations

### Backend
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** with Row Level Security
- **CloudFlare R2** for cost-effective storage
- **Redis** for caching layer

### Security
- End-to-end encryption (Signal Protocol)
- Biometric authentication
- Secure local storage with React Native Keychain
- JWT token management with refresh token rotation

## Project Structure

```
├── app/                    # Expo Router app directory
├── assets/                 # Images, animations, fonts
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Shared components (Button, Input, etc.)
│   │   ├── onboarding/   # Onboarding flow components
│   │   ├── groups/       # Group-related components
│   │   ├── feed/         # Feed and content components
│   │   ├── auth/         # Authentication components
│   │   └── moderation/   # Content moderation components
│   ├── screens/          # Screen components
│   ├── services/         # API and service integrations
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── store/            # Zustand stores
│   ├── constants/        # App constants and configuration
│   └── navigation/       # Navigation configuration
├── package.json
├── tsconfig.json
├── app.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quizgamesplayerslogo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your:
   - Supabase URL and API key
   - CloudFlare R2 credentials
   - Other configuration values

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your preferred platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **TypeScript** for static type checking

Pre-commit hooks will automatically:
- Lint and format staged files
- Run type checking
- Prevent commits with errors

## Database Setup

### Supabase Schema

The application requires the following database tables:

- `users` - User profiles and preferences
- `groups` - Private group information
- `group_members` - Group membership with roles
- `shares` - Shared photos and content
- `comments` - Comments on shares
- `reactions` - Emoji reactions
- `daily_selections` - Daily photo selection tracking
- `user_actions` - Audit trail for user actions

Refer to `/docs/database-schema.sql` for the complete schema.

### Row Level Security (RLS)

All tables have RLS policies to ensure:
- Users can only access their own data and group data
- Group members can only see content from their groups
- Proper authorization for all operations

## Architecture Highlights

### Client-Side Photo Processing
- Random photo selection happens entirely on the device
- Images are compressed and encrypted before upload
- EXIF metadata is stripped for privacy
- Multi-resolution generation for performance

### Real-Time Features
- WebSocket connections for instant updates
- Live feed updates when content is posted/deleted
- Real-time comment and reaction notifications
- Efficient cache invalidation

### Cost Optimization
- Aggressive caching at multiple levels (CDN, Redis, client)
- Tiered storage (hot/warm/cold)
- Image compression and WebP format
- Deduplication for identical images
- Automatic cleanup on deletion

## Development Roadmap

### Phase 1: Foundation (Weeks 1-8) ✅
- [x] Project setup and infrastructure
- [x] Database design and backend foundation
- [x] Authentication and security setup
- [x] Basic mobile app structure

### Phase 2: Core Features (Weeks 9-16) 🚧
- [ ] Onboarding flow implementation
- [ ] Photo selection and processing
- [ ] Group management system
- [ ] Daily selection logic

### Phase 3: Content Sharing (Weeks 17-24)
- [ ] Content sharing system
- [ ] Real-time feed
- [ ] User content control features
- [ ] Push notifications

### Phase 4: Optimization (Weeks 25-32)
- [ ] Performance optimization
- [ ] Web dashboard
- [ ] Security hardening
- [ ] Testing and launch prep

### Phase 5: Launch (Weeks 33-40)
- [ ] Beta testing
- [ ] App store submission
- [ ] Monitoring and analytics
- [ ] Public launch

## Cost Projections

| User Scale | Monthly Cost |
|-----------|--------------|
| 1M DAU    | $2,680       |
| 10M DAU   | $19,100      |
| 50M DAU   | $77,500      |
| 100M DAU  | $142,000     |

Costs include:
- Database (Supabase)
- Storage (CloudFlare R2)
- CDN & Bandwidth
- Compute (Vercel)
- Real-time & WebSockets
- Notifications & Services
- Monitoring & Security

## Privacy & Security

### Privacy Features
- No tracking or analytics without consent
- Client-side photo processing
- End-to-end encryption
- Automatic content deletion after 30 days
- No public data exposure

### Security Measures
- JWT authentication with secure refresh
- Biometric authentication support
- Row Level Security (RLS) in database
- Rate limiting on all endpoints
- Secure local storage
- Regular security audits

## Contributing

This is a proprietary project. Contributions are currently limited to the core development team.

## License

Copyright © 2025. All rights reserved.

## Support

For questions or issues:
- Email: support@privacyfirst.social
- Documentation: [Coming Soon]

## Team

- Technical Lead / Full-stack Developer
- 2 React Native Mobile Developers
- 1 Backend Developer
- 1 Frontend Developer
- 1 DevOps/Infrastructure Engineer
- 1 Security/Privacy Engineer

## Acknowledgments

Built with modern tools and frameworks:
- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/)
- [CloudFlare R2](https://www.cloudflare.com/products/r2/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query)

---

**Note:** This is an active development project. Features and documentation are continuously evolving.
