# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development
npm run dev                # Start development server with Vite

# Build
npm run build             # Build for production with Vite

# Linting
npm run lint              # Run ESLint on all files

# Preview
npm run preview           # Preview production build locally
```

## Project Architecture

This is a React TypeScript application built with Vite, serving as a real estate platform for property listing and management. The codebase follows a modular architecture with clear separation between different user roles and functionality.

### Core Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI components
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Google Maps API
- **State Management**: React Context + custom hooks

### Module Structure

The application is organized into three main modules:

#### 1. Owner Module (`src/modules/owner/`)
Property owners can list, manage, and track their properties through a sophisticated Property Wizard system.

**Key Components:**
- **Property Wizard**: Multi-step form system with flow-based architecture
  - Located in `src/modules/owner/components/property/wizard/`
  - Supports 8 different property flows (residential rent/sale, commercial, land, etc.)
  - Flow-specific step identifiers (e.g., `res_rent_basic_details`, `com_sale_location`)
  - Data stored in standardized JSON structure in `properties_v2.property_details`

**Property Wizard Architecture:**
- **Flows**: Defined in `constants/flows.ts` - each flow has unique step sequences
- **Components**: Reusable form sections that adapt based on `stepId` parameter
- **Services**: Flow services handle data formatting and flow detection
- **Data Structure**: All data stored under `details.{stepId}.{fieldName}` pattern

#### 2. Seeker Module (`src/modules/seeker/`)
Property seekers can search, filter, and view properties with advanced search capabilities.

**Key Features:**
- Advanced search with multiple filters
- Google Maps integration for location-based search
- Property detail pages with comprehensive information
- Favorites system for saving properties

#### 3. Admin/Moderator Modules (`src/modules/admin/`, `src/modules/moderator/`)
Administrative interfaces for user management and property moderation.

### Data Architecture

#### Property Data Structure
All properties use a standardized JSON format in `properties_v2.property_details`:

```json
{
  "meta": {
    "_version": "v3",
    "status": "draft|published|archived"
  },
  "flow": {
    "category": "residential|commercial|land",
    "listingType": "rent|sale|pghostel|flatmates|coworking"
  },
  "details": {
    "res_rent_basic_details": { /* step-specific data */ },
    "res_rent_location": { /* step-specific data */ },
    "res_rent_rental": { /* step-specific data */ }
  },
  "media": {
    "photos": { "images": [] },
    "videos": { "urls": [] }
  }
}
```

#### Flow Types and Steps
- **Residential**: `rent`, `sale`, `flatmates`, `pghostel`
- **Commercial**: `rent`, `sale`, `coworking`
- **Land**: `sale`

Each flow has 4-5 steps with unique identifiers following the pattern: `{category}_{type}_{step_name}`

### Key Configuration Files

#### Application Configuration
- `config/app-config.yml`: Pagination, search settings, feature flags
- `config/home-config.yml`: Homepage-specific settings

#### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations
```

### Supabase Integration

- **Client**: `src/lib/supabase.ts` - Regular and admin clients
- **Types**: `src/lib/database.types.ts` - Generated database types
- **Storage**: Separate buckets for property images and videos

### Search Architecture

The search system (`src/components/Search/`) provides:
- Real-time search with debouncing (300ms)
- Multiple search services with fallback
- Location-based and text-based search
- Advanced filtering capabilities

### Property Wizard Deep Dive

When working with the Property Wizard:

1. **Flow Detection**: Automatically determined from URL params and user selections
2. **Step Navigation**: Each step saves data to its specific path in the form
3. **Component Reuse**: Same components serve multiple flows via `stepId` prop
4. **Data Persistence**: Form data auto-saved and can be resumed
5. **Validation**: Step-by-step validation before allowing navigation

**Important Files:**
- `wizard/PropertyForm/index.tsx`: Main wizard container
- `wizard/constants/flows.ts`: Flow and step definitions
- `wizard/types.ts`: TypeScript interfaces
- `wizard/services/flows/`: Flow-specific services

### Development Patterns

#### Form Data Access
Use the `useStepData` pattern for consistent data access:
```typescript
const saveField = (fieldName: string, value: any) => {
  form.setValue(`details.${stepId}.${fieldName}`, value);
};

const getField = (fieldName: string, defaultValue?: any) => {
  return form.getValues(`details.${stepId}.${fieldName}`) ?? defaultValue;
};
```

#### Component Props
Most form components expect:
```typescript
interface ComponentProps {
  stepId: string;         // Flow-specific identifier
  form: UseFormReturn<FormData>;
  mode?: 'create' | 'edit';
}
```

#### Route Structure
- `/`: Homepage with property search
- `/properties/list/{category}/{type}`: Property wizard
- `/properties/{id}`: Property details (seeker view)
- `/dashboard`: Owner dashboard
- `/admin/*`: Admin routes
- `/moderator/*`: Moderator routes

### Testing and Debugging

The application includes comprehensive debugging tools:
- `DebugToggle.tsx`: Shows/hides debug information
- `FormDataDebug.tsx`: Displays current form state
- `FlowContextDebug.tsx`: Shows flow detection information

### Performance Considerations

- Images: Lazy loading with `LazyImage.tsx`
- Maps: Conditional loading of Google Maps API
- Search: Debounced with configurable delays
- Pagination: Configurable page sizes in app-config.yml

### Key Hooks and Utilities

- `usePropertyForm.ts`: Main form state management
- `useStepNavigation.ts`: Step navigation logic
- `useAppConfig.ts`: Access to app configuration
- `useAuth.ts`: Authentication state
- `useFavorites.ts`: Favorites management

This architecture provides a scalable, maintainable system for property management with clear separation of concerns and reusable components across different property types and user roles.