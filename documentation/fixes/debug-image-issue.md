# Debug Image Issue - Testing Guide

## Current Status
- **Issue**: Old property images not displaying, only new optimized images work
- **Fix Applied**: Added comprehensive debugging and prioritized direct storage lookup
- **Ready for Testing**: ✅ Build successful with debug logs

## How to Test

### 1. Open Browser Developer Tools
- Press F12 or right-click → Inspect
- Go to Console tab
- Clear console logs

### 2. Navigate to Property Listings
- Go to any page with property listings
- Look for properties with images

### 3. Check Console Logs
Look for these debug messages:

```
[PropertyItem] Loading image for property {propertyId}, fileName: {fileName}
[UnifiedImageService] Processing image: {fileName}
[UnifiedImageService] Is optimization image: {true/false}
[UnifiedImageService] Is legacy image: {true/false}
[UnifiedImageService] Handling as {type} image
```

### 4. For Old Images (Not Displaying)
Expected debug flow:
```
[PropertyItem] Loading image for property ABC123, fileName: some-old-image.jpg
[UnifiedImageService] Processing image: some-old-image.jpg
[UnifiedImageService] Is optimization image: false
[UnifiedImageService] Is legacy image: false
[UnifiedImageService] Handling as regular image
[UnifiedImageService] Direct URL failed for ABC123/some-old-image.jpg
[UnifiedImageService] File not found in storage: ABC123/some-old-image.jpg
```

### 5. For New Images (Working)
Expected debug flow:
```
[PropertyItem] Loading image for property XYZ789, fileName: optimization_12345
[UnifiedImageService] Processing image: optimization_12345
[UnifiedImageService] Is optimization image: true
[UnifiedImageService] Is legacy image: false
[UnifiedImageService] Handling as optimization image
[UnifiedImageService] Querying optimization record for ID: 12345
[UnifiedImageService] Optimization image loaded successfully: {url}
```

## What to Look For

### 1. Filename Patterns
- **Old images**: Regular filenames like `image1.jpg`, `photo.png`, `property-image.webp`
- **New images**: Optimization format like `optimization_12345`

### 2. Storage Issues
- Check if files actually exist in Supabase storage
- Verify bucket name and path structure
- Look for 404 errors in Network tab

### 3. Database Issues
- Check if `image_optimizations` table queries are working
- Verify optimization IDs are correct

## Next Steps Based on Results

### If Old Images Are Not Found in Storage
- Need to check actual file paths in Supabase storage
- May need to adjust path generation logic

### If Files Exist But URLs Are Wrong
- Need to fix URL generation logic
- Check Supabase public URL generation

### If Optimization Table Queries Fail
- Need to adjust database query format
- Check table permissions and RLS policies

## Quick Fix Options

### Option 1: Force Direct Storage for All Images
If optimization table is causing issues, we can disable it temporarily:
```typescript
// In unifiedImageService.ts
this.config.enableOptimization = false;
```

### Option 2: Adjust File Path Logic
If files are in different paths, we can add more path variants:
```typescript
// Try different path patterns
const pathVariants = [
  `${propertyId}/${fileName}`,
  `${propertyId}/images/${fileName}`,
  `images/${propertyId}/${fileName}`,
  `legacy/${propertyId}/${fileName}`
];
```

### Option 3: Fallback to Old Service
If unified service fails, we can fallback to the old fastImageService:
```typescript
// In PropertyItem.tsx
const oldUrl = fastImageService.getPublicImageUrl(propertyId, fileName);
```

## Report Back
Please share the console logs and let me know:
1. What filename patterns you see for old vs new images
2. What error messages appear
3. Whether files exist in Supabase storage
4. Which debugging path the old images follow

This will help identify the exact issue and implement the right fix.