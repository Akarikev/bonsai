# Contributing to Bonsai 🌳

Thank you for your interest in contributing to Bonsai! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/Akarikev/bonsai/issues) section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Include expected and actual behavior
- Add screenshots if applicable
- Specify your environment (OS, Node/Bun version, etc.)

### Suggesting Features

- Check if the feature has already been suggested in the [Issues](https://github.com/Akarikev/bonsai/issues) section
- Use the feature request template
- Explain why this feature would be useful
- Include any relevant examples or use cases

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Run tests and ensure they pass
5. Update documentation if necessary
6. Submit a pull request

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/Akarikev/bonsai.git
cd bonsai
```

2. Install dependencies:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun run dev
```

## Project Structure

```
bonsai/
├─ src/
│  ├─ bonsai/                # Core state management
│  │  ├─ tree.ts            # Tree state implementation
│  │  ├─ flat.ts            # Flat state implementation
│  │  ├─ usetreebonsai.ts   # React hook for tree state
│  │  ├─ createStore.ts     # Store creation utilities
│  │  ├─ middleware.ts      # Middleware system
│  │  ├─ types.ts           # TypeScript type definitions
│  │  ├─ utils.ts           # Utility functions
│  │  ├─ constants.ts       # Shared constants
│  │  ├─ devlog.ts          # Development logging
│  │  └─ examples/          # Example implementations
│  ├─ devtools/             # Development tools
│  │  └─ dev-panel.tsx      # DevTools UI component
│  ├─ index.ts              # Main entry point
│  └─ main.tsx              # Development playground
├─ docs/                    # Documentation
│  ├─ BONSAI.MD            # Core documentation
│  └─ USEBONSAI.MD         # Usage guide
├─ tests/                   # Test files
└─ dist/                    # Build output
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Maintain strict type checking
- Document complex types with JSDoc comments
- Use meaningful type names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### State Management

- Keep state updates predictable
- Document state shape
- Use middleware for side effects
- Maintain immutability

### Testing

- Write tests for new features
- Maintain test coverage
- Use meaningful test descriptions
- Test edge cases

## Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Documentation

- Update README.md for significant changes
- Document new features in USEBONSAI.MD
- Add JSDoc comments for new functions
- Include examples for new features

## Review Process

1. All pull requests require at least one review
2. CI checks must pass
3. Code must follow project standards
4. Documentation must be updated
5. Tests must be included

## Getting Help

- Check the [documentation](https://github.com/Akarikev/bonsai#readme)
- Open an issue for questions
- Join our community discussions

## License

By contributing to Bonsai, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

Thank you for contributing to Bonsai! 🌳
