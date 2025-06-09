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
│  │  ├─ dev-panel.tsx      # DevTools UI component
│  │  └─ index.ts           # DevTools entry point
│  ├─ index.ts              # Main entry point
│  └─ main.tsx              # Development playground
├─ docs/                    # Documentation
│  ├─ BONSAI.MD            # Core documentation
│  └─ USEBONSAI.MD         # Usage guide
├─ tests/                   # Test files
└─ dist/                    # Build output
    ├─ index.d.ts          # Main package type declarations
    ├─ devtools.d.ts       # DevTools type declarations
    ├─ index.mjs           # ESM bundle
    └─ devtools.mjs        # DevTools ESM bundle
```

## Build Process

The project uses Vite for building and bundling. The build process:

1. Generates TypeScript declaration files (`.d.ts`)
2. Creates ESM and CommonJS bundles
3. Handles multiple entry points (main package and DevTools)
4. Automatically excludes DevTools from production builds

To build the project:

```bash
bun run build
```

### Type Declarations

Type declarations are automatically generated during the build process:

- `dist/index.d.ts`: Main package types
- `dist/devtools.d.ts`: DevTools types

These files are:

- Used for development and type checking
- Not included in production bundles
- Required for proper TypeScript support

### DevTools

The DevTools component is:

- Optional and only included when explicitly imported
- Automatically excluded from production builds
- Available as a separate entry point: `@bonsai-ts/state/devtools`

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Maintain strict type checking
- Document complex types with JSDoc comments
- Use meaningful type names
- Ensure type declarations are generated correctly

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices
- Document component props and usage

### State Management

- Keep state updates predictable
- Document state shape
- Use middleware for side effects
- Maintain immutability
- Follow the established patterns for tree and flat state

### Testing

- Write tests for new features
- Maintain test coverage
- Use meaningful test descriptions
- Test edge cases
- Include benchmarks for performance-critical code

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
- `perf`: Performance improvements
- `build`: Build system changes

## Documentation

- Update README.md for significant changes
- Document new features in USEBONSAI.MD
- Add JSDoc comments for new functions
- Include examples for new features
- Keep type declarations up to date

## Review Process

1. All pull requests require at least one review
2. CI checks must pass
3. Code must follow project standards
4. Documentation must be updated
5. Tests must be included
6. Type declarations must be generated correctly

## Getting Help

- Check the [documentation](https://github.com/Akarikev/bonsai#readme)
- Open an issue for questions
- Join our community discussions

## License

By contributing to Bonsai, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

Thank you for contributing to Bonsai! 🌳
