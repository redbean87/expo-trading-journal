# Trading Journal App - Claude Guidelines

## Project Overview

A mobile trading journal app built with Expo/React Native for tracking and analyzing trades.

## Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Node**: 20.x (managed via Volta)

## Project Structure

```
app/
  _layout.tsx        # Root layout (PaperProvider)
  (tabs)/
    _layout.tsx      # Tab navigator configuration
    index.tsx        # Home screen route
    trades.tsx       # Trades list screen route
    add-trade.tsx    # Add trade form screen route
    analytics.tsx    # Analytics screen route
src/
  screens/           # Screen components (re-exported by app/ routes)
  store/             # Zustand stores
  types/             # TypeScript interfaces and types
```

## Code Style

### Components

- Use functional components with hooks
- Use default exports for screens
- Use named exports for reusable components
- Keep components focused and single-purpose

### TypeScript

- Define types in `src/types/index.ts`
- Use strict typing - avoid `any` when possible
- Always use `type` instead of `interface`

### State Management

- Use Zustand for global state
- Persist data with AsyncStorage
- Keep store actions async when dealing with storage

### Naming Conventions

- **Files**: kebab-case (e.g., `home-screen.tsx`, `trade-store.ts`)
- **Components/Types**: PascalCase (e.g., `HomeScreen`, `Trade`)
- **Functions/Variables/Hooks**: camelCase (e.g., `useTradeStore`, `loadTrades`)

## Don'ts

- Don't use class components
- Don't add unnecessary dependencies without discussion
- Don't use inline styles unless absolutely necessary - use StyleSheet.create
- Don't store sensitive data (API keys, credentials) in code
- Don't use `any` type unless absolutely necessary
- Don't over-comment code - prefer self-documenting code with clear naming

## Testing

- Test on both iOS and Android when making UI changes
- Run `npm start` to launch Expo dev server

## Common Commands

```bash
npm start       # Start Expo dev server
npm run android # Run on Android
npm run ios     # Run on iOS
npm run web     # Run on web
```
