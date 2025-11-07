# Architecture Documentation

## 🏗️ Project Structure

Bu loyiha **feature-based architecture** asosida qurilgan. Har bir feature o'z papkasida va o'zining komponentlari, hook'lari, service'lari va type'lariga ega.

## 📁 Directory Structure

```
src/
├── components/          # Shared components
│   ├── ui/             # Shadcn/ui components
│   ├── common/         # Common reusable components
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components
├── features/           # Feature modules
│   ├── auth/           # Authentication feature
│   ├── bot-constructor/ # Bot constructor feature
│   ├── projects/       # Project management
│   └── collections/    # Collections management
├── lib/                # Utility functions
├── hooks/              # Global custom hooks
├── services/           # API services
├── types/              # Global TypeScript types
└── styles/             # Global styles
```

## 🎯 Feature Structure

Har bir feature quyidagi strukturaga ega:

```
features/[feature-name]/
├── components/         # Feature-specific components
├── hooks/             # Feature-specific hooks
├── services/          # Feature-specific services
├── store/             # Feature-specific state
├── types/             # Feature-specific types
└── index.ts           # Feature exports
```

## 🔄 Data Flow

1. **UI Components** → User interactions
2. **Custom Hooks** → Business logic
3. **Services** → API calls
4. **Store** → State management
5. **Components** → UI updates

## 🧩 Component Architecture

### Component Types

1. **UI Components**: Basic UI elements (Button, Input, etc.)
2. **Feature Components**: Feature-specific components
3. **Layout Components**: Page layouts and navigation
4. **Form Components**: Form-specific components

### Component Structure

```typescript
// ComponentName/
├── index.ts           # Export
├── ComponentName.tsx  # Main component
├── types.ts          # Component types
├── hooks.ts          # Component hooks
└── utils.ts          # Component utilities
```

## 🔧 State Management

Loyiha **Zustand** ishlatadi state management uchun:

- **Global Store**: Umumiy application state
- **Feature Stores**: Feature-specific state
- **Component State**: Local component state

## 🌐 API Layer

API xizmatlari **React Query** bilan integratsiya qilingan:

- **Services**: API call functions
- **Hooks**: React Query hooks
- **Types**: API response types

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Component library
- **CSS Variables**: Theme customization

## 🔒 Type Safety

- **TypeScript**: Full type safety
- **Strict Mode**: Enabled
- **Path Mapping**: Absolute imports
- **Type Exports**: Centralized type definitions

## 📱 Responsive Design

- **Mobile-first**: Mobile-first approach
- **Breakpoints**: Tailwind breakpoints
- **Flexible Layouts**: CSS Grid and Flexbox

## 🚀 Performance

- **Code Splitting**: Dynamic imports
- **Lazy Loading**: Component lazy loading
- **Memoization**: React.memo and useMemo
- **Bundle Optimization**: Next.js optimizations

## 🧪 Testing Strategy

- **Unit Tests**: Component testing
- **Integration Tests**: Feature testing
- **E2E Tests**: User flow testing

## 📦 Build Process

1. **TypeScript Compilation**
2. **Next.js Build**
3. **Static Generation**
4. **Bundle Optimization**

## 🔄 Development Workflow

1. **Feature Development**: Feature-based development
2. **Component Creation**: Reusable components
3. **Type Definition**: TypeScript types
4. **Testing**: Unit and integration tests
5. **Documentation**: Code documentation
