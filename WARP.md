# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **Waqf Platform** - a continuous charity management system built as a hybrid Next.js/Rust application using the Juno framework. The platform manages Islamic charitable endowments (waqf) with modern payment processing and impact tracking.

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code with Prettier
npm run format
```

### Juno (Backend) Commands
```bash
# Start local Juno emulator for development
juno emulator start

# Deploy to production satellite
juno hosting deploy

# Build and deploy (configured in juno.config.mjs)
# This automatically runs: npm run build -> deploy to satellite
```

### Rust (Satellite) Development
```bash
# Build Rust satellite code
cargo build --target wasm32-unknown-unknown --release

# Run Rust tests
cargo test

# Check Rust code
cargo check

# Format Rust code  
cargo fmt
```

## Architecture Overview

### Hybrid Architecture: Next.js Frontend + Rust Backend
The application uses a unique architecture combining:
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Rust-based "satellite" running on Juno's decentralized infrastructure
- **Database**: Juno's document-based storage with collections
- **Authentication**: Juno's built-in auth system with role-based access

### Key Architectural Components

#### 1. Next.js Frontend (`src/app/`)
- **Landing Page**: Public marketing site with hero, features, testimonials
- **Admin Dashboard** (`/admin`): Administrative interface for platform management
- **Waqf Dashboard** (`/waqf`): User interface for managing charitable endowments
- **Authentication Flow**: Role-based routing (admins → `/admin`, users → `/waqf`)

#### 2. Rust Satellite Backend (`src/satellite/`)
The satellite acts as a smart contract-like backend with:
- **Document Hooks**: Validation and business logic for data operations
- **Collections Management**: Handles 7 main collections:
  - `admins` - Platform administrators
  - `causes` - Charitable causes/categories
  - `admin_requests` - Admin permission requests
  - `activity_logs` - System audit trail
  - `waqfs` - Main waqf endowments
  - `donations` - Individual donation records
  - `allocations` - Fund distribution records

#### 3. Payment Integration (`src/lib/payment/`)
Multi-gateway payment system supporting:
- **Providers**: Stripe, PayPal, Flutterwave, Paystack, Razorpay
- **Regional Optimization**: Automatic gateway selection based on currency/country
- **Fallback System**: Automatic retry with alternative gateways
- **Currency Support**: USD, EUR, GBP, NGN, KES, GHS, ZAR, INR, SAR, AED

#### 4. Data Architecture
**Waqf Entity Structure**:
- **Core Data**: Name, description, asset value, status
- **Donor Profile**: Personal information and preferences  
- **Financial Metrics**: Donations, distributions, investment returns
- **Preferences**: Notification and reporting settings
- **Audit Trail**: Creation, updates, contribution tracking

### Critical Implementation Details

#### Crypto Polyfill System
The app includes a sophisticated crypto polyfill system for browser compatibility:
- **Early Initialization**: `crypto-init.js` loads before React hydration
- **Global Shim**: `crypto-global-shim.ts` ensures `global.crypto` availability
- **Component Integration**: `CryptoInitializer` component manages initialization

#### Role-Based Access Control
- **Authentication Provider**: Centralized auth state management
- **Route Protection**: Automatic redirects based on user roles
- **Permission Hooks**: Custom hooks for admin/creator role validation

#### State Management
- **AuthProvider**: Global authentication state
- **WaqfProvider**: Waqf-specific data and operations
- **React Query**: Server state management and caching

### Development Workflow

1. **Frontend Development**: 
   - Start with `npm run dev` for hot reload
   - Use component-based architecture with TypeScript
   - Follow existing patterns in `/src/components/` and `/src/app/`

2. **Backend Development**:
   - Modify Rust hooks in `/src/satellite/src/`
   - Test with local Juno emulator: `juno emulator start`
   - Deploy changes: `juno hosting deploy`

3. **Full Stack Changes**:
   - Frontend changes auto-reload with dev server
   - Backend changes require satellite rebuild and deployment
   - Use development satellite ID for testing

### Key Configuration Files

- **`juno.config.mjs`**: Juno deployment configuration, satellite IDs
- **`next.config.mjs`**: Next.js + Juno integration, crypto fallbacks  
- **`package.json`**: Scripts, dependencies, postinstall hooks
- **`Cargo.toml`**: Rust workspace configuration for satellite

### Testing Strategy
- Frontend: Component testing with existing patterns
- Backend: Rust unit tests for hook validation logic
- Integration: Use development satellite for end-to-end testing
- Payment: Test mode configurations for all gateways

### Important Notes
- Always test payment flows in sandbox/test mode first
- The satellite enforces strict validation - check hook implementations before data operations
- Crypto initialization is critical for browser compatibility - don't modify without testing
- Role-based routing is automatic - users are redirected based on authentication state