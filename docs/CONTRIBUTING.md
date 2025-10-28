# Contributing to Privacy Social

Thank you for your interest in contributing to Privacy Social! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/DamienB88/quizgamesplayerslogo/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, device, app version)

### Suggesting Enhancements

1. Check existing issues and discussions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its benefits
4. Provide examples or mockups if possible

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Write or update tests** for your changes
5. **Update documentation** as needed
6. **Run all checks**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```
7. **Commit your changes** using conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   ```
8. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
9. **Open a Pull Request** with a clear description

## Development Setup

See [README.md](../README.md#getting-started) for setup instructions.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible
- Use strict mode

### Code Style

- Follow the ESLint and Prettier configurations
- Use functional components with hooks
- Keep components small and focused
- Write self-documenting code with clear names

### Naming Conventions

- **Files**: PascalCase for components (`Button.tsx`), camelCase for utilities (`formatDate.ts`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Interfaces/Types**: PascalCase (`UserProfile`, `ApiResponse`)

### Component Structure

```typescript
// Imports
import React from 'react';
import type { FC } from 'react';

// Types/Interfaces
export interface ComponentProps {
  // props
}

// Component
export const Component: FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render logic

  return (
    // JSX
  );
};

// Styles
const styles = StyleSheet.create({
  // styles
});
```

### Git Workflow

We use **Git Flow** with the following branches:

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add user profile editing
fix: resolve photo upload error on iOS
docs: update API documentation
```

## Testing

### Unit Tests

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:
```typescript
describe('formatDate', () => {
  it('should format date in MM/DD/YYYY format', () => {
    // Arrange
    const date = new Date('2024-01-15');

    // Act
    const result = formatDate(date);

    // Assert
    expect(result).toBe('01/15/2024');
  });
});
```

### Component Tests

- Test component rendering
- Test user interactions
- Test edge cases
- Use React Testing Library

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update technical documentation in `/docs`
- Create or update Storybook stories for components

## Review Process

1. All PRs require at least one review
2. CI/CD checks must pass
3. Maintain code coverage
4. Address review comments
5. Squash commits before merging

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to ask questions by:
- Opening an issue with the `question` label
- Reaching out to the maintainers
- Joining our community discussions

Thank you for contributing to Privacy Social!
