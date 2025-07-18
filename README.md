# btAdmin - Bhoomitalli Frontend Application

**Status:** Production Ready  
**Type:** React Frontend Application  
**Integration:** btService API Client Ready

A comprehensive React frontend application for the Bhoomitalli real estate platform, built with modern web technologies including React 18, TypeScript, and Tailwind CSS.

## Technology Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Radix UI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Maps:** Google Maps API
- **State Management:** React Context + custom hooks
- **Build Tool:** Vite
- **Testing:** Jest + React Testing Library

## Quick Start

### Development Setup

```bash
cd bAdminV1
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the bAdminV1 directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# btService API
VITE_BTSERVICE_URL=http://localhost:3001/api
VITE_BTSERVICE_API_KEY=your_btservice_api_key

# Application Configuration
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:host     # Start with network access

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI

# Linting and Type Checking
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript compiler check

# Deployment
npm run deploy       # Deploy to production
```

## Project Structure

```
bAdminV1/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Search/       # Search functionality
│   │   ├── ui/           # Base UI components
│   │   └── admin/        # Admin-specific components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   └── lib/              # Core libraries
├── config/               # Application configuration
├── operations/           # Non-project dependent files
├── supabase/             # Supabase configuration
└── docs/                 # Documentation
```

## Key Features

### Search Integration
- **btService Integration:** API client for search service
- **NLP Search:** Natural language property search
- **Smart Filters:** Advanced property filtering
- **Real-time Results:** Live search updates
- **Property Codes:** Direct property lookup

### Authentication
- **Supabase Auth:** Complete authentication system
- **User Roles:** Admin, moderator, owner, seeker
- **Protected Routes:** Role-based access control
- **Session Management:** Persistent user sessions

### Property Management
- **Property Listing:** Complete property creation flow
- **Image Upload:** Optimized image handling
- **Location Services:** Google Maps integration
- **Property Types:** Residential, commercial, land
- **Multi-step Forms:** Wizard-based property creation

### User Interface
- **Modern Design:** Clean, responsive UI
- **Dark Mode:** Theme switching capability
- **Mobile Responsive:** Works on all screen sizes
- **Accessibility:** WCAG compliant components
- **Performance:** Optimized loading and rendering

## Configuration

### App Configuration

Configuration files are located in the `config/` directory:

- **`app-config.yml`** - Application-wide settings
- **`home-config.yml`** - Homepage specific configuration

### Component Configuration

- **`components.json`** - UI component configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`vite.config.ts`** - Vite build configuration

## Search Integration with btService

### API Client Setup

The application includes a dedicated btService client:

```typescript
// src/components/Search/services/btServiceClient.ts
import { SearchFilters, SearchOptions } from '../types/search.types';

export class BtServiceClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async search(filters: SearchFilters, options: SearchOptions) {
    // Implementation details
  }

  async nlpSearch(query: string, options: SearchOptions) {
    // NLP search implementation
  }
}
```

### Usage Examples

```typescript
// Basic search
const results = await btServiceClient.search({
  searchQuery: "apartment",
  selectedLocation: "gachibowli",
  selectedPropertyType: "residential"
}, {
  page: 1,
  limit: 20
});

// NLP search
const nlpResults = await btServiceClient.nlpSearch(
  "3bhk apartment in gachibowli under 50l",
  { page: 1, limit: 20 }
);
```

## Database Integration

### Supabase Configuration

The application uses Supabase for:
- **Authentication:** User management and auth
- **Database:** Property data storage
- **Real-time:** Live data updates
- **Storage:** File and image storage

### Key Database Tables
- **properties_v2** - Main property data
- **users** - User information
- **favorites** - User favorites
- **search_history** - Search analytics

## Development Guidelines

### Code Quality
- **TypeScript:** Strict type checking enabled
- **ESLint:** Code linting and formatting
- **Prettier:** Code formatting
- **Husky:** Git hooks for code quality

### Testing Strategy
- **Unit Tests:** Component and utility testing
- **Integration Tests:** API integration testing
- **E2E Tests:** End-to-end user workflows
- **Visual Tests:** UI component testing

### Performance Optimization
- **Code Splitting:** Dynamic imports for routes
- **Lazy Loading:** Components and images
- **Caching:** API response caching
- **Bundle Analysis:** Webpack bundle analyzer

## Deployment

### Build Process

```bash
# Production build
npm run build

# Build output location
dist/
```

### Deployment Options

1. **Static Hosting** (Current)
   - Vite build + static hosting
   - CDN distribution
   - Environment-specific builds

2. **Container Deployment**
   - Docker container support
   - Kubernetes deployment
   - CI/CD pipeline integration

### Environment Configuration

Create environment-specific `.env` files:
- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.staging` - Staging environment

## Integration Points

### btService API Integration
- **Search Endpoints:** All search functionality
- **Property Lookups:** Direct property access
- **NLP Processing:** Natural language queries
- **Caching:** Response caching strategy

### External Services
- **Google Maps:** Location services and mapping
- **Supabase:** Database and authentication
- **Image Services:** Optimized image delivery

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Check Supabase credentials in `.env`
   - Verify network connectivity
   - Check Row Level Security policies

2. **API Integration**
   - Verify btService URL configuration
   - Check API key authentication
   - Monitor CORS settings

3. **Build Issues**
   - Clear `node_modules` and reinstall
   - Check TypeScript configuration
   - Verify environment variables

### Debug Resources
- **Browser Console:** Client-side debugging
- **Network Tab:** API request monitoring
- **React DevTools:** Component inspection
- **Supabase Dashboard:** Database monitoring

## File Organization

### Operations Folder
All non-project dependent files are organized in `operations/`:
- **unit_tests/** - Test scripts and utilities
- **utils/** - Development and maintenance tools
- **tasks/** - Task management and documentation
- **docs/** - Project documentation
- **archive/** - Archived files and legacy code

### Key Directories
- **src/components/Search/** - Search functionality
- **src/pages/** - Page components
- **src/contexts/** - React context providers
- **src/services/** - API service clients
- **config/** - Application configuration

## Performance Metrics

### Target Performance
- **First Contentful Paint:** <2s
- **Search Response Time:** <500ms
- **Bundle Size:** <2MB compressed
- **Lighthouse Score:** >90

### Monitoring
- **Core Web Vitals:** LCP, FID, CLS tracking
- **API Performance:** Response time monitoring
- **Error Tracking:** Client-side error logging
- **User Analytics:** Usage pattern analysis

## Support and Maintenance

### Documentation
- **Component Docs:** Storybook documentation
- **API Docs:** OpenAPI specification
- **User Guide:** End-user documentation
- **Developer Guide:** Technical documentation

### Maintenance Tasks
- **Dependency Updates:** Monthly security updates
- **Performance Monitoring:** Response time tracking
- **Error Monitoring:** Client-side error tracking
- **Security Audits:** Regular security reviews

---

**Current Status:** Production Ready  
**Next Steps:** Deploy btService integration to production environment