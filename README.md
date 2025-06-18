# @veksa/reselect-utils

[![npm version](https://img.shields.io/npm/v/@veksa/reselect-utils.svg?style=flat-square)](https://www.npmjs.com/package/@veksa/reselect-utils)
[![npm downloads](https://img.shields.io/npm/dm/@veksa/reselect-utils.svg?style=flat-square)](https://www.npmjs.com/package/@veksa/reselect-utils)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.md)

A powerful toolkit that extends the capabilities of @veksa/reselect and @veksa/re-reselect by providing utilities for advanced selector composition, safe property access, and optimized caching. This library helps you build more maintainable and efficient Redux selectors with enhanced type safety and functional programming patterns.

## Features

- **Chain Selector Pattern** - Build selector pipelines with fluent interfaces for complex data transformations
- **Powerful Path Selectors** - Safely traverse and select nested object properties with protection against null/undefined
- **Bound Selectors** - Create selectors with predefined parameters for reuse across components
- **Adapted Selectors** - Transform selector parameters to simplify composition and reuse
- **Enhanced Structured Selectors** - Better typed alternatives to createStructuredSelector with caching support
- **Key Selector Composition** - Compose key selectors for complex cache keys in re-reselect
- **Custom Caching** - Optimize performance with advanced garbage collection and cache strategies
- **TypeScript Support** - Full TypeScript type definitions with strict typing

## Installation

@veksa/reselect-utils requires **TypeScript 5.8 or later**.

### Using npm or yarn

```bash
# npm
npm install @veksa/reselect-utils

# yarn
yarn add @veksa/reselect-utils
```

## Examples

### Comparing @veksa/reselect, @veksa/re-reselect, and @veksa/reselect-utils

#### Problem: Working with optional nested data

Imagine we need to select a nested property from a state object that might not exist at every level.

#### @veksa/reselect implementation

```typescript
import { createSelector } from '@veksa/reselect';

const getUser = (state) => state.user;

const getUserAddress = createSelector(
  getUser,
  (user) => {
    // Need null checks at each level
    if (user && user.contact && user.contact.address) {
      return user.contact.address;
    }
    return undefined;
  }
);

// Usage:
const address = getUserAddress(state);  // May be undefined
```

With standard @veksa/reselect, you need to handle potential null/undefined values at each level with conditional checks.

#### @veksa/re-reselect solution

```typescript
import { createCachedSelector } from '@veksa/re-reselect';

const getUser = (state) => state.user;
const getUserId = (state, userId) => userId;

// Using re-reselect for caching by userId
const getUserAddressByUserId = createCachedSelector(
  getUser,
  getUserId,
  (user, userId) => {
    // Still need null checks for nested properties
    const targetUser = user[userId];
    if (targetUser && targetUser.contact && targetUser.contact.address) {
      return targetUser.contact.address;
    }
    return undefined;
  }
)((state, userId) => userId);

// Usage with better caching by userId:
const address = getUserAddressByUserId(state, '123');
```

@veksa/re-reselect adds caching benefits but still requires the same null checks for property access.

#### @veksa/reselect-utils solution

```typescript
import { createPathSelector } from '@veksa/reselect-utils';

// Clean path selection with built-in null handling
const getUserAddress = createPathSelector(
  (state) => state.user, 
  (user) => user.contact?.address
);

// For parametric selectors
const getUserAddressByUserId = createPathSelector(
  (state, userId) => state.users?.[userId],
  (user) => user?.contact?.address
);

// Usage:
const address = getUserAddress(state);  // Safely returns undefined if path is broken
const userAddress = getUserAddressByUserId(state, '123');  // With parameters
```

@veksa/reselect-utils provides safer property access with path selectors that handle null/undefined values automatically.

### Basic Usage Patterns

#### Chain Selectors

```typescript
import { createChainSelector } from '@veksa/reselect-utils';

// Create a base selector
const getUserData = state => state.users;

// Build a selector chain
const getActiveUserEmails = createChainSelector(getUserData)
  .map(users => users.filter(user => user.active))
  .map(activeUsers => activeUsers.map(user => user.email))
  .build();

// Usage:
const activeEmails = getActiveUserEmails(state); // ['alice@example.com', 'bob@example.com']
```

#### Path Selectors for Safe Object Access

```typescript
import { createPathSelector } from '@veksa/reselect-utils';

// Safe access to deeply nested properties
const getUserCity = createPathSelector(
  state => state.currentUser,
  user => user?.contact?.address?.city
);

// Usage:
const city = getUserCity(state); // Returns city or undefined if any part of the path is null/undefined
```

#### Bound Selectors for Partial Application

```typescript
import { createSelector } from '@veksa/reselect';
import { createBoundSelector } from '@veksa/reselect-utils';

// Original parametric selector
const getUsersByRole = createSelector(
  state => state.users,
  (state, role) => role,
  (users, role) => users.filter(user => user.role === role)
);

// Create a bound selector with predefined role
const getAdmins = createBoundSelector(
  getUsersByRole,
  (state) => ['admin'] // Arguments to pass to original selector
);

// Usage:
const admins = getAdmins(state); // Same as getUsersByRole(state, 'admin')
```

## Advanced Examples

### Using Structured Selectors

```typescript
import { createCachedStructuredSelector } from '@veksa/reselect-utils';

const getUserProfile = createCachedStructuredSelector({
  name: state => state.user.name,
  email: state => state.user.email,
  address: createPathSelector(
    state => state.user,
    user => user?.contact?.address
  )
})((state, userId) => userId);

// Usage:
const profile = getUserProfile(state, '123');
// Returns: { name: 'John', email: 'john@example.com', address: { ... } }
```

### Key Selector Composition

```typescript
import { createKeySelectorCreator, stringComposeKeySelectors } from '@veksa/reselect-utils';

const createKeySelector = createKeySelectorCreator(
  stringComposeKeySelectors,
  (a, b) => `${a}:${b}`
);

const keySelector = createKeySelector(
  (state, props) => props.userId,
  (state, props) => props.view
);

// Usage:
// keySelector(state, { userId: '123', view: 'details' }) returns '123:details'
```

## API Reference

### Core Functions

#### createChainSelector
Creates a selector that can be chained with map and chain methods.

```typescript
createChainSelector(baseSelector)
  .map(transformFn)
  .build();
```

#### createPathSelector
Creates a selector that safely accesses nested properties.

```typescript
createPathSelector(sourceSelector, pathFn);
```

#### createBoundSelector
Creates a selector with predefined parameters.

```typescript
createBoundSelector(selector, getParams);
```

#### createAdaptedSelector
Adapts a selector to work with a different parameter shape.

```typescript
createAdaptedSelector(selector, paramsAdapter);
```

#### createCachedStructuredSelector
Creates a structured selector with caching support.

```typescript
createCachedStructuredSelector(selectors)(keySelector);
```

### Cache Objects

#### TreeCache

Implements a hierarchical cache structure for nested key support. Unlike flat cache objects, TreeCache allows for efficiently caching and retrieving selectors with complex, multi-part keys.

```typescript
import { TreeCache } from '@veksa/reselect-utils';

// Create a TreeCache instance
const cache = new TreeCache({
  cacheObjectCreator: () => new FlatObjectCache() // Optional custom cache factory
});

// Use with complex keys (automatically normalized to arrays)
const complexKey = ['user', 123, 'profile'];
cache.set(complexKey, selectorInstance);
const selector = cache.get(complexKey);
```

#### IntervalMapCache and Garbage Collection

A time-based cache implementation with automatic garbage collection for unused selectors to prevent memory leaks.

```typescript
import { IntervalMapCache, initGarbageCollector } from '@veksa/reselect-utils';

// Initialize garbage collector to clean up stale cache entries
initGarbageCollector();

// Create a cache that automatically manages memory
const cache = new IntervalMapCache();

// Items not accessed within the cache lifetime will be automatically purged
cache.set('key', selectorData);
```

### Comparing with @veksa/reselect and @veksa/re-reselect

| Feature | @veksa/reselect | @veksa/re-reselect | @veksa/reselect-utils |
|---------|-----------------|--------------------|-----------------------|
| Basic memoization | ✓ | ✓ | ✓ (via dependencies) |
| Parametric memoization | × | ✓ | ✓ (via dependencies) |
| Safe nested property access | × | × | ✓ |
| Fluent selector chains | × | × | ✓ |
| Parameter binding | × | × | ✓ |
| Parameter adaptation | × | × | ✓ |
| Advanced key composition | × | Limited | ✓ |
| Cache garbage collection | × | × | ✓ |
| Hierarchical caching | × | × | ✓ |
| Typescript support | ✓ | ✓ | ✓ (enhanced) |

## Contributing

This project welcomes contributions and suggestions. Feel free to submit a Pull Request.

## License

[MIT](LICENSE.md)
