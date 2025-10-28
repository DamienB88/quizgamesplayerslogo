# Privacy Social - Privacy-First Social Media App

A privacy-first social media application that combines spontaneous photo sharing with complete user control. Built with React Native, Expo, and Supabase.

## 🚀 Project Overview

Privacy Social is a mobile-first social application that:

- **Respects Privacy**: End-to-end encryption, minimal data collection, 30-day auto-deletion
- **User-Controlled**: Choose between auto-publish or review mode for daily photo selections
- **Private Groups Only**: No public feeds, no algorithms - just private groups with your friends
- **Full Content Control**: Edit, delete, and moderate your own content at any time

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Infrastructure Setup](#infrastructure-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🏁 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Expo CLI**: Latest version
- **Docker** (optional, for local development)
- **iOS Simulator** or **Android Emulator** (for mobile testing)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/DamienB88/quizgamesplayerslogo.git
cd quizgamesplayerslogo
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env and add your credentials
```

4. **Start the development server**

```bash
npm start
```

5. **Run on iOS or Android**

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Project Structure

```
privacy-social-app/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   ├── (tabs)/              # Main app tabs
│   ├── (onboarding)/        # Onboarding flow
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   ├── navigation/          # Navigation configuration
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── services/            # API and external services
│   ├── store/               # State management (Zustand)
│   ├── types/               # TypeScript type definitions
│   ├── config/              # App configuration
│   └── constants/           # App constants
├── assets/                  # Images, fonts, animations
├── database/                # Database migrations and scripts
├── docs/                    # Documentation
├── __tests__/               # Test files
├── .github/                 # GitHub Actions workflows
├── .storybook/              # Storybook configuration
└── docker-compose.yml       # Docker setup

```

## 🛠️ Development

### Available Scripts

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Code formatting
npm run format
npm run format:check

# Storybook
npm run storybook
```

### Development Workflow

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Run quality checks**

```bash
npm run lint
npm run type-check
npm run test
```

4. **Commit your changes**

```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push and create PR**

```bash
git push origin feature/your-feature-name
```

### Code Quality

This project uses:

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Unit testing
- **Storybook**: Component development and documentation

## 🏗️ Infrastructure Setup

### Required Services

1. **Supabase** - Database and Authentication
   - See [database/SUPABASE_SETUP.md](database/SUPABASE_SETUP.md)

2. **CloudFlare R2** - Image Storage
   - See [docs/CLOUDFLARE_R2_SETUP.md](docs/CLOUDFLARE_R2_SETUP.md)

3. **Vercel** - Web Dashboard Deployment
   - See [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md)

4. **Firebase** - Push Notifications
   - Setup guide coming in Phase 2

### Docker Development

For local development with Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

This starts:
- React Native development server
- PostgreSQL database
- Redis cache
- Adminer (database UI)

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Component Testing with Storybook

```bash
npm run storybook
```

Visit http://localhost:6006 to view components.

### E2E Testing

Coming in Phase 3 with Detox.

## 🚀 Deployment

### Mobile Apps

**iOS**

```bash
# Build for iOS
eas build --platform ios
```

**Android**

```bash
# Build for Android
eas build --platform android
```

### Web Dashboard

**Vercel** (automatic on push to main)

```bash
# Manual deploy
vercel --prod
```

## 📊 Development Roadmap

### ✅ Phase 1: Foundation & Setup (Weeks 1-8) - CURRENT

- [x] Project setup and infrastructure
- [x] Database design
- [x] Authentication foundation
- [x] Basic mobile app structure

### 🔄 Phase 2: Core Features (Weeks 9-16) - NEXT

- [ ] Onboarding flow
- [ ] Photo selection and processing
- [ ] Group management
- [ ] Daily selection logic

### 📋 Phase 3: Content Sharing (Weeks 17-24)

- [ ] Content sharing system
- [ ] Real-time feed
- [ ] User content control
- [ ] Push notifications

### 🎯 Phase 4: Optimization & Polish (Weeks 25-32)

- [ ] Performance optimization
- [ ] Web dashboard
- [ ] Security hardening
- [ ] Testing & QA

### 🎉 Phase 5: Launch (Weeks 33-40)

- [ ] Beta testing
- [ ] App store submission
- [ ] Monitoring & analytics
- [ ] Public launch

## 🔒 Security & Privacy

This app is built with privacy as the core principle:

- **End-to-end encryption** for all communications
- **Client-side photo processing** to minimize server access
- **30-day automatic deletion** of all content
- **No public feeds** or algorithmic recommendations
- **Minimal data collection** - only what's necessary
- **User control** over all shared content
- **GDPR compliant** data handling

See our [Privacy Policy](docs/PRIVACY_POLICY.md) for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Team

- **Technical Lead**: TBD
- **Mobile Developers**: TBD
- **Backend Developer**: TBD
- **UI/UX Designer**: TBD

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/DamienB88/quizgamesplayerslogo/issues)
- **Email**: support@privacysocial.app (coming soon)

## 🙏 Acknowledgments

Built with:

- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Supabase](https://supabase.com)
- [CloudFlare R2](https://www.cloudflare.com/products/r2/)
- [Vercel](https://vercel.com)

---

**Note**: This project is currently in **Phase 1 (Foundation & Setup)**. Week 1-2 infrastructure setup is complete. Core features will be implemented in Phase 2.

For detailed technical architecture, see [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md).
