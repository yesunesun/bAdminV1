# Guide: Creating a New Property Wizard Flow

When adding a new flow (like sale or rent) to your property wizard, follow these structured steps to avoid navigation issues and ensure a seamless user experience.

## Step 1: Plan and Define the Flow

1. **Document the Complete Flow**
   - Create a flow diagram showing all possible paths
   - Define all steps with clear entry and exit points
   - Specify which steps are conditional and which are always shown

2. **Define the Data Model**
   - Identify all form fields required for the new flow
   - Determine which fields are shared with existing flows and which are unique
   - Define validation rules for each field

## Step 2: Update Constants and Type Definitions

1. **Update Step Definitions**
   - Add new steps to your `STEPS` constant in `constants.ts`
   - Ensure each step has a unique `id`, clear `title`, and appropriate `icon`

2. **Update Type Definitions**
   - Extend your `FormData` type in `types.ts` to include new fields
   - Add proper validation schemas for the new fields

3. **Create Flow Navigation Map**
   - Define explicit navigation paths for the new flow:
   ```typescript
   // Example flow configuration
   const FLOW_PATHS = {
     'residential_sale': {
       sequence: ['details', 'location', 'sale', 'features', 'review', 'photos'],
       conditionalPaths: {}
     },
     'residential_rent': {
       sequence: ['details', 'location', 'rental', 'features', 'review', 'photos'],
       conditionalPaths: {}
     },
     'your_new_flow': {
       sequence: ['details', 'location', 'your_new_step', 'features', 'review', 'photos'],
       conditionalPaths: {}
     }
   };
   ```

## Step 3: Create Step Components

1. **Create Form Sections**
   - Implement a component for each unique step in your flow
   - Put it in the appropriate location (e.g., `sections/YourNewStep.tsx`)
   - Keep each component focused on a single responsibility

2. **Build with Consistency**
   - Use the same patterns as existing components
   - Maintain consistent validation approach
   - Structure prop interfaces consistently

## Step 4: Update Navigation Logic

1. **Modify Flow Detection Logic**
   ```typescript
   // In useStepNavigation.ts or similar
   const determineFlowType = (form: UseFormReturn<FormData>): 'sale' | 'rent' | 'your_new_flow' => {
     // Get values from form and URL
     const formValues = form.getValues();
     const urlPath = window.location.pathname.toLowerCase();
     
     // Check for indicators of your new flow
     if (urlPath.includes('your_new_flow') || formValues.flowType === 'your_new_flow') {
       return 'your_new_flow';
     }
     
     // Check for sale indicators
     if (urlPath.includes('sale') || formValues.listingType === 'sale') {
       return 'sale';
     }
     
     // Default to rent
     return 'rent';
   };
   ```

2. **Update Step Visibility Logic**
   ```typescript
   const getVisibleSteps = useCallback(() => {
     const flowType = determineFlowType(form);
     
     return STEPS.map(step => ({
       ...step,
       hidden: !FLOW_PATHS[flowType].sequence.includes(step.id)
     }));
   }, [form, STEPS]);
   ```

3. **Create Direct Navigation Handlers**
   ```typescript
   const handleNextStep = useCallback(() => {
     const flowType = determineFlowType(form);
     const currentStepId = STEPS[formStep - 1]?.id;
     const currentSequence = FLOW_PATHS[flowType].sequence;
     
     // Find current position in flow
     const currentIndex = currentSequence.indexOf(currentStepId);
     
     // Move to next step in the defined sequence
     if (currentIndex !== -1 && currentIndex < currentSequence.length - 1) {
       const nextStepId = currentSequence[currentIndex + 1];
       const nextStepIndex = STEPS.findIndex(s => s.id === nextStepId) + 1;
       setCurrentStep(nextStepIndex);
     }
   }, [form, formStep, STEPS, setCurrentStep]);
   ```

## Step 5: Update Form Content Component

1. **Add the New Step to the Rendering Logic**
   ```typescript
   // In FormContent.tsx
   const FormContent = ({ form, formStep, STEPS, ...props }) => {
     const currentStepId = STEPS[formStep - 1]?.id;
     
     // Render components based on step ID
     switch (currentStepId) {
       // Existing steps...
       
       case 'your_new_step':
         return <YourNewStep form={form} {...props} />;
       
       // More steps...
       
       default:
         return <div>Unknown step</div>;
     }
   };
   ```

## Step 6: Implement Data Synchronization

1. **Add Effect Hooks for State Consistency**
   ```typescript
   // Ensure form values are consistent with selected flow
   useEffect(() => {
     const flowType = determineFlowType(form);
     
     // Set appropriate values based on flow type
     if (flowType === 'your_new_flow') {
       form.setValue('flowType', 'your_new_flow');
       // Set other required fields
     }
   }, [form]);
   ```

## Step 7: Test Thoroughly

1. **Create Test Cases**
   - Test forward navigation through each step
   - Test backward navigation through each step
   - Test jumping directly to specific steps via URL
   - Test refreshing at each step
   - Test validity of form data at each step

2. **Add Debug Attributes**
   - Add `data-flow-type` and `data-current-step` attributes to key components
   - Use these attributes for visual verification during testing

## Files That May Need Changes

| File | Purpose | Possible Changes |
|------|---------|------------------|
| `src/modules/owner/components/property/wizard/constants.ts` | Define steps, options, and flow constants | Add new step IDs, flow types, and property options |
| `src/modules/owner/components/property/wizard/types.ts` | Type definitions for the form data | Add new field types for the new flow |
| `src/modules/owner/components/property/wizard/validationSchemas.ts` | Define validation rules | Add validation rules for new fields |
| `src/modules/owner/components/property/wizard/PropertyForm/index.tsx` | Main form container | Update flow detection and step initialization |
| `src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts` | Navigation logic | Add new flow path and navigation handlers |
| `src/modules/owner/components/property/wizard/PropertyForm/components/FormContent.tsx` | Render step components | Add case for new step component |
| `src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx` | Next/Prev buttons | Update navigation button handlers |
| `src/modules/owner/components/property/wizard/sections/YourNewStep.tsx` | New step component | Create new step UI and logic |
| `src/modules/owner/components/property/wizard/sections/PropertySummary.tsx` | Review summary | Add display for new flow's fields |
| `src/modules/owner/hooks/usePropertyForm.ts` | Form initialization | Update to handle new flow type |
| `src/modules/owner/hooks/usePropertyFormNavigation.ts` | URL-based navigation | Add URL patterns for new flow |
| `src/modules/owner/hooks/usePropertyFormState.ts` | Form state management | Handle new flow's form state |
| `src/modules/owner/hooks/usePropertyFormValidation.ts` | Validation logic | Add validation for new flow steps |
| `src/modules/owner/services/propertyService.ts` | Backend service calls | Add API methods for new flow if needed |
| `src/modules/owner/routes.tsx` | Route definitions | Add routes for the new flow |

## Navigation Button Handling

When implementing navigation buttons in wizard flows, it's critical to handle the Previous and Next buttons correctly for each step:

```typescript
// Custom previous button handler example
const onPreviousClick = () => {
  try {
    // Extract the base URL without the current step
    const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
    
    // Special handling for Previous from Rental or Sale tabs
    if (currentStepId === 'rental' || currentStepId === 'sale') {
      // Always go back to location from rental/sale
      navigate(`${baseUrl}/location`);
      return;
    }
    
    // Special handling for Previous from Features
    if (currentStepId === 'features') {
      if (isSaleProperty()) {
        // Go back to sale from features in sale flow
        navigate(`${baseUrl}/sale`);
      } else {
        // Go back to rental from features in rental flow
        navigate(`${baseUrl}/rental`);
      }
      return;
    }
    
    // Get the previous step ID
    const prevStepIndex = formStep - 2;
    const prevStepId = prevStepIndex >= 0 ? STEPS[prevStepIndex]?.id : 'details';
    
    // Navigate to previous step
    navigate(`${baseUrl}/${prevStepId}`);
  } catch (error) {
    // Fallback to original handler
    handlePreviousStep();
  }
};
```

## Best Practices to Remember

1. **Single Source of Truth**
   - Store flow type determination in one place
   - Derive all navigation logic from this source

2. **URL-State Synchronization**
   - Keep URL parameters in sync with form state
   - Use the URL as the primary indicator of current step

3. **Form State Management**
   - Use React Hook Form methods (`setValue`, `watch`, etc.) consistently
   - Validate form at appropriate times (not excessively)

4. **Avoid Redundant Checks**
   - Define flow detection logic in one place
   - Use memoization to prevent recalculating flow type unnecessarily

5. **Direct Navigation Handlers**
   - Implement specific logic for each step transition
   - Handle special cases (like Previous from Sale/Rental to Location)
   - Provide fallbacks when direct navigation fails

6. **Clear Error Handling**
   - Add specific error messages for navigation failures
   - Provide fallback paths when navigation fails

By following these steps, you'll create a robust, maintainable wizard flow that avoids navigation issues and provides a seamless user experience.
