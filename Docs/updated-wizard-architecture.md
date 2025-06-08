# Property Wizard Architecture Overview

## Architecture Overview

The Property Wizard follows a **flow-based architecture** where:

1. **Flows** define the complete property listing journey (e.g., Residential Rent, Commercial Sale)
2. **Steps** are individual sections within a flow (e.g., Basic Details, Location)
3. **Components** are reusable UI elements that handle specific steps
4. **Data** is stored in a standardized JSON structure with flow-specific step identifiers

### Key Principles

- **Flow-Specific Step IDs**: Each step has a unique identifier tied to its flow (e.g., `res_rent_basic_details`)
- **Component Reusability**: Same UI components can serve multiple flows via mapping
- **Standardized Data Structure**: Consistent JSON format across all flows
- **No Loose Fields**: All data stored within organized step containers
- **Flexible Evolution**: Easy to customize without affecting other flows

## Data Structure & Storage

### Database Schema

Data is stored in Supabase table `properties_v2`:
- `id`: UUID primary key
- `owner_id`: UUID foreign key to user
- `property_details`: JSONB field (our main data storage)
- Other metadata fields

### Standard JSON Format

All property data follows this consistent structure regardless of flow:

```json
{
  "meta": {
    "_version": "v3",
    "id": "property-uuid",
    "owner_id": "user-uuid",
    "created_at": "2025-05-14T10:00:00Z",
    "updated_at": "2025-05-14T10:30:00Z",
    "status": "draft|published|archived"
  },
  "flow": {
    "category": "residential|commercial|land",
    "listingType": "rent|sale|pghostel|flatmates|coworking"
  },
  "steps": {
    "res_rent_basic_details": {
      "propertyType": "Apartment",
      "bhkType": "2BHK",
      "floor": 3,
      "totalFloors": 15,
      "builtUpArea": 1200,
      "builtUpAreaUnit": "sqft"
    },
    "res_rent_location": {
      "address": "123 Main Street",
      "city": "Hyderabad",
      "state": "Telangana",
      "pinCode": "500001",
      "coordinates": {
        "latitude": 17.3850,
        "longitude": 78.4867
      }
    },
    "res_rent_rental": {
      "rentAmount": 25000,
      "securityDeposit": 50000,
      "maintenanceCharges": 3000,
      "availableFrom": "2025-06-01"
    },
    "res_rent_features": {
      "amenities": ["Parking", "Gym", "Swimming Pool"],
      "description": "Beautiful apartment with modern amenities"
    }
  },
  "media": {
    "photos": {
      "images": [
        {
          "id": "img-1",
          "url": "/path/to/image.jpg",
          "isPrimary": true,
          "displayOrder": 1
        }
      ]
    },
    "videos": {
      "urls": ["video-url-1"]
    }
  }
}
```

### Key Data Structure Points

1. **No root-level fields** except meta, flow, steps, and media
2. **All property data** goes under `steps` with flow-specific step keys
3. **Consistent structure** across all property types
4. **Easy to extend** without breaking existing functionality

### Data Saving Process

1. **User fills form** step by step
2. **Component saves data** to `steps.{stepId}.{fieldName}`
3. **On save/publish**, complete JSON is stored in `properties_v2.property_details`
4. **Database structure**:
   ```sql
   INSERT INTO properties_v2 (id, owner_id, property_details, status)
   VALUES (uuid, user_id, json_object, 'draft');
   ```

## Flow Configuration

### Defining Flows

All flows are configured in `flows.ts`:

```typescript
// flows.ts

// 1. Define flow types
export const FLOW_TYPES = {
  RESIDENTIAL_RENT: 'residential_rent',
  RESIDENTIAL_SALE: 'residential_sale',
  RESIDENTIAL_PGHOSTEL: 'residential_pghostel',
  COMMERCIAL_RENT: 'commercial_rent',
  COMMERCIAL_SALE: 'commercial_sale',
  COMMERCIAL_COWORKING: 'commercial_coworking',
  LAND_SALE: 'land_sale',
  // ... other flows
};

// 2. Define steps for each flow
export const FLOW_STEPS = {
  residential_rent: [
    'res_rent_basic_details',
    'res_rent_location',
    'res_rent_rental',
    'res_rent_features',
    'res_rent_review'
  ],
  
  residential_sale: [
    'res_sale_basic_details',
    'res_sale_location',
    'res_sale_sale_details',
    'res_sale_features',
    'res_sale_review'
  ],
  
  residential_pghostel: [
    'res_pg_basic_details',
    'res_pg_location',
    'res_pg_pg_details',
    'res_pg_features',
    'res_pg_review'
  ],
  
  commercial_rent: [
    'com_rent_basic_details',
    'com_rent_location',
    'com_rent_rental',
    'com_rent_features',
    'com_rent_review'
  ],
  
  commercial_sale: [
    'com_sale_basic_details',
    'com_sale_location',
    'com_sale_sale_details',
    'com_sale_features',
    'com_sale_review'
  ],
  
  commercial_coworking: [
    'com_cw_basic_details',
    'com_cw_location',
    'com_cw_coworking_details',
    'com_cw_features',
    'com_cw_review'
  ],
  
  land_sale: [
    'land_sale_basic_details',
    'land_sale_location',
    'land_sale_sale_details',
    'land_sale_land_features',
    'land_sale_review'
  ]
};

// 3. Define step metadata
export const STEP_METADATA = {
  // Residential Rent steps
  res_rent_basic_details: {
    id: 'res_rent_basic_details',
    name: 'Basic Details',
    component: 'PropertyDetails',
    icon: Home,
    description: 'Tell us about your property'
  },
  
  res_rent_location: {
    id: 'res_rent_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  
  res_rent_rental: {
    id: 'res_rent_rental',
    name: 'Rental Details',
    component: 'RentalDetails',
    icon: DollarSign,
    description: 'Specify rental terms'
  },
  
  // Residential Sale steps
  res_sale_basic_details: {
    id: 'res_sale_basic_details',
    name: 'Basic Details',
    component: 'PropertyDetails',
    icon: Home,
    description: 'Tell us about your property'
  },
  
  res_sale_location: {
    id: 'res_sale_location',
    name: 'Location',
    component: 'LocationDetails', // Same component as rent
    icon: MapPin,
    description: 'Where is your property located?'
  },
  
  res_sale_sale_details: {
    id: 'res_sale_sale_details',
    name: 'Sale Details',
    component: 'SaleDetails',
    icon: DollarSign,
    description: 'Specify sale terms'
  },
  
  // PG/Hostel steps
  res_pg_pg_details: {
    id: 'res_pg_pg_details',
    name: 'PG Details',
    component: 'PGDetails', // Specialized component
    icon: Building,
    description: 'Tell us about your PG/Hostel'
  },
  
  // Commercial Coworking steps
  com_cw_coworking_details: {
    id: 'com_cw_coworking_details',
    name: 'Coworking Details',
    component: 'CoworkingDetails',
    icon: Briefcase,
    description: 'Coworking space details'
  },
  
  // Land Sale steps
  land_sale_land_features: {
    id: 'land_sale_land_features',
    name: 'Land Features',
    component: 'LandFeatures',
    icon: Map,
    description: 'Specific land characteristics'
  },
  
  // Shared steps
  common_review: {
    id: 'review',
    name: 'Review',
    component: 'ReviewAndSubmit',
    icon: FileText,
    description: 'Review and submit your listing'
  }
  // ... other steps
};

// 4. Helper function to get step components
export const getStepsForFlow = (flowType: string) => {
  const steps = FLOW_STEPS[flowType] || [];
  return steps.map(stepId => STEP_METADATA[stepId]);
};
```

## Components Architecture

### Component Structure

Each step component follows this pattern:

```typescript
// Example: RentalDetails.tsx
interface RentalDetailsProps {
  stepId: string;  // e.g., 'res_rent_rental'
  form: UseFormReturn<FormData>;
  mode?: 'create' | 'edit';
}

const RentalDetails: React.FC<RentalDetailsProps> = ({ stepId, form, mode }) => {
  // Save data to flow-specific step
  const saveField = (fieldName: string, value: any) => {
    form.setValue(`steps.${stepId}.${fieldName}`, value, { shouldValidate: true });
  };
  
  // Read data from flow-specific step
  const getField = (fieldName: string, defaultValue?: any) => {
    return form.getValues(`steps.${stepId}.${fieldName}`) ?? defaultValue;
  };
  
  // Component can adapt based on stepId if needed
  const isCommercial = stepId.includes('com_');
  
  return (
    <FormSection>
      <div>
        <label>Rent Amount</label>
        <input
          value={getField('rentAmount', '')}
          onChange={(e) => saveField('rentAmount', e.target.value)}
        />
      </div>
      
      {/* Add commercial-specific fields if needed */}
      {isCommercial && <CommercialRentalFields />}
    </FormSection>
  );
};
```

### Component Registry

Components are mapped via the step metadata:

```typescript
// componentRegistry.ts
import { 
  PropertyDetails, 
  LocationDetails, 
  RentalDetails, 
  SaleDetails,
  PGDetails,
  CoworkingDetails,
  LandFeatures,
  PropertyAmenities,
  ReviewAndSubmit 
} from './sections';

export const COMPONENT_REGISTRY = {
  PropertyDetails,
  LocationDetails,
  RentalDetails,
  SaleDetails,
  PGDetails,
  CoworkingDetails,
  LandFeatures,
  PropertyAmenities,
  ReviewAndSubmit,
  // ... other components
};

// Get component for a step
export const getComponentForStep = (stepId: string) => {
  const metadata = STEP_METADATA[stepId];
  return COMPONENT_REGISTRY[metadata?.component] || null;
};
```

## Flow Service Architecture

### Base Flow Service

```typescript
// BaseFlowService.ts
export abstract class BaseFlowService implements FlowServiceInterface {
  protected category: string = 'residential';
  protected listingType: string = 'rent';
  
  abstract detectFlow(formData: any, flowContext: FlowContext): boolean;
  
  formatData(formData: any): FormData {
    // Ensure data is in correct format
    const output = {
      meta: this.createMeta(formData),
      flow: {
        category: this.category,
        listingType: this.listingType
      },
      steps: formData.steps || {},
      media: formData.media || { photos: { images: [] } }
    };
    
    return output;
  }
  
  getFlowType(): string {
    return `${this.category}_${this.listingType}`;
  }
  
  getFlowKey(): string {
    return this.getFlowType();
  }
}
```

### Flow Service Examples

```typescript
// ResidentialRentFlowService.ts
export class ResidentialRentFlowService extends BaseFlowService {
  protected category: string = 'residential';
  protected listingType: string = 'rent';
  
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    return flowContext.urlPath.includes('residential') && 
           flowContext.urlPath.includes('rent');
  }
}

// PGHostelFlowService.ts
export class PGHostelFlowService extends BaseFlowService {
  protected category: string = 'residential';
  protected listingType: string = 'pghostel';
  
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    return flowContext.isPGHostelMode || 
           flowContext.urlPath.includes('pghostel');
  }
}

// CommercialCoworkingFlowService.ts
export class CommercialCoworkingFlowService extends BaseFlowService {
  protected category: string = 'commercial';
  protected listingType: string = 'coworking';
  
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    return flowContext.urlPath.includes('coworking');
  }
}
```

## Form State Management

### Form Data Structure

```typescript
// types.ts
export interface FormData {
  meta?: {
    _version: string;
    id?: string;
    owner_id?: string;
    created_at: string;
    updated_at: string;
    status: 'draft' | 'published' | 'archived';
  };
  
  flow?: {
    category: "residential" | "commercial" | "land";
    listingType: string;
  };
  
  steps: {
    [stepId: string]: {
      [fieldName: string]: any;
    };
  };
  
  media?: {
    photos: {
      images: PropertyImage[];
    };
    videos?: {
      urls: string[];
    };
  };
}
```

### Step Navigation

The wizard navigation follows this pattern:

1. User selects property category and listing type
2. System determines appropriate flow (e.g., `residential_rent`)
3. Wizard displays steps defined for that flow
4. Each step saves data to its designated section in `steps`
5. Upon completion, data is saved to `properties_v2.property_details`

### Flow Detection

Flow detection happens through:

1. URL path analysis
2. User selections
3. Existing data inspection
4. Flow context flags

```typescript
// Flow detection example
const detectCurrentFlow = (urlPath: string, formData: any): string => {
  // Check URL path
  if (urlPath.includes('commercial') && urlPath.includes('coworking')) {
    return 'commercial_coworking';
  }
  
  // Check form data
  if (formData?.flow?.listingType === 'pghostel') {
    return 'residential_pghostel';
  }
  
  // Default fallback
  return 'residential_rent';
};
```

## Key Files and Their Roles

### Core Components

#### 1. `PropertyForm/index.tsx`
**Role**: Main wizard container component that orchestrates the entire flow
- Determines the current flow type
- Manages overall form state
- Handles navigation between steps
- Coordinates with flow services
- Manages save/publish operations

```typescript
// Used extensively throughout the application
<PropertyForm 
  initialData={existingData}
  propertyId={propertyId}
  mode="create"
  selectedCategory="residential"
  selectedAdType="rent"
/>
```

#### 2. `StepNavigation.tsx`
**Role**: Handles navigation between wizard steps
- Shows previous/next buttons
- Handles step validation
- Manages navigation state
- Coordinates with form validation

```typescript
// Controls step-by-step progression
<StepNavigation 
  formStep={currentStep}
  STEPS={flowSteps}
  handlePreviousStep={handlePrevious}
  handleNextStep={handleNext}
  savedPropertyId={propertyId}
  onSave={handleSave}
  onPublish={handlePublish}
/>
```

#### 3. `FormContent.tsx`
**Role**: Renders the appropriate component for each step
- Maps stepId to the correct component
- Passes required props to step components
- Handles component loading/rendering

```typescript
// Dynamically renders step content
<FormContent 
  form={form}
  formStep={currentStep}
  STEPS={flowSteps}
  effectiveCategory={category}
  effectiveAdType={adType}
/>
```

### Configuration Files

#### 4. `flows.ts`
**Role**: Central configuration for all flows and steps
- Defines all available flows
- Specifies steps for each flow
- Maps components to steps
- Provides step metadata (icons, names, descriptions)

```typescript
// Primary configuration file
export const FLOW_STEPS = {
  residential_rent: [...steps],
  commercial_sale: [...steps],
  // etc.
};
```

#### 5. `types.ts`
**Role**: TypeScript definitions for the entire system
- Defines FormData structure
- Specifies component prop interfaces
- Type safety for all operations

### Service Files

#### 6. `FlowServiceFactory.ts`
**Role**: Determines the correct flow service based on context
- Analyzes URL, form data, and user selections
- Returns appropriate flow service instance
- Handles flow detection logic

#### 7. `BaseFlowService.ts`
**Role**: Common functionality for all flow services
- Provides base formatData method
- Handles meta and flow information
- Template for specific flow services

#### 8. `propertyService.ts`
**Role**: Handles all database operations
- Saves properties to Supabase
- Updates existing properties
- Retrieves property data

### Utility Files

#### 9. `formDataUtils.ts`
**Role**: Helper functions for form data management
- `useStepData` hook for consistent data access
- Field saving and retrieval utilities
- Form state management helpers

#### 10. `componentRegistry.ts`
**Role**: Maps component names to actual React components
- Central registry of all step components
- Used by FormContent to load correct component

### Section Components

#### 11. Section components (e.g., `PropertyDetails.tsx`, `LocationDetails.tsx`)
**Role**: Individual form sections that collect specific data
- Render form fields for their section
- Save data to flow-specific paths
- Handle validation for their fields

```typescript
// Example usage
<PropertyDetails 
  stepId="res_rent_basic_details"
  form={form}
  mode="create"
/>
```

### Hook Files

#### 12. `usePropertyForm.ts`
**Role**: Main form state management hook
- Initializes form with React Hook Form
- Manages overall form state
- Coordinates between different operations

#### 13. `useStepNavigation.ts`
**Role**: Manages step navigation logic
- Determines visible steps based on flow
- Handles step transitions
- Validates steps before navigation

#### 14. `usePropertyFormOperations.ts`
**Role**: Handles save/publish operations
- Formats data before saving
- Calls appropriate APIs
- Manages operation states (loading, error)

## Benefits of This Architecture

1. **Maintainable**: Clear separation between flows and components
2. **Scalable**: Easy to add new property types and flows
3. **Flexible**: Same component can serve multiple flows
4. **Consistent**: Standardized data structure across all types
5. **Extensible**: New features can be added without breaking existing flows
6. **Debuggable**: Each step's data is isolated and inspectable
7. **Type-safe**: Full TypeScript support for all flows and steps
