# DevTools

Development utilities for the Bhoomitalli project.

## Property Inspector

The `property-inspector.js` script helps you inspect property data by analyzing both Supabase storage files and database records.

### Usage

```bash
node property-inspector.js <property-id>
```

### Example

```bash
node property-inspector.js 123e4567-e89b-12d3-a456-426614174000
```

### What it does

1. **Lists Storage Files**: Shows all files in the property's Supabase storage folder (`property-images-v2` bucket under `<property-id>/` folder)
2. **Fetches Database Record**: Retrieves the property record from the `properties_v2` table
3. **Analyzes ImageFiles**: Extracts and displays the `imageFiles` section from `property_details` JSON
4. **Generates Markdown Report**: Creates a comprehensive `<property-id>.md` file with all inspection results

### Output

The script provides:
- **Console Output**: Real-time inspection results with file listings and property metadata
- **Markdown Report**: Complete `<property-id>.md` file containing:
  - File listing with sizes from Supabase storage (`property-images-v2` bucket)
  - Property metadata (title, status, category, type, dates)
  - Raw `property_details` JSON structure
  - Parsed `imageFiles` array with individual file listings
  - Location analysis of where image data is stored in the JSON structure
  - Storage vs Database file count comparison

### Requirements

- Node.js environment
- Supabase environment variables configured in `.env` file:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Error Handling

The script handles:
- Invalid UUID format validation
- Missing environment variables
- Storage access errors
- Database query errors
- Missing property records

### Sample Output

**Console Output:**
```
🔍 Property Inspector Tool
==================================================
Property ID: 123e4567-e89b-12d3-a456-426614174000
Storage Bucket: property-images-v2
Storage Folder: 123e4567-e89b-12d3-a456-426614174000/
==================================================

🔍 Listing files in storage folder: 123e4567-e89b-12d3-a456-426614174000/
📂 Found 3 files in storage:
   1. image1.jpg (245.67 KB)
   2. image2.jpg (189.43 KB)
   3. thumbnail.jpg (45.21 KB)

🔍 Fetching property record: 123e4567-e89b-12d3-a456-426614174000
✅ Property record found
   Title: Beautiful 2BHK Apartment
   Created: 2024-01-15T10:30:00.000Z
   Status: active
   Category: residential
   Type: rent

📸 Analyzing imageFiles section:
   Location: media.photos.images
   Count: 3
   Raw data: [...]
   
📝 Individual files:
   1. image1.jpg
   2. image2.jpg
   3. thumbnail.jpg

📝 Generating markdown report...
📝 Markdown report saved: 123e4567-e89b-12d3-a456-426614174000.md

✅ Inspection complete!
📄 Report saved to: /path/to/devtools/123e4567-e89b-12d3-a456-426614174000.md
```

**Generated Markdown Report (`123e4567-e89b-12d3-a456-426614174000.md`):**
```markdown
# Property Inspection Report

**Property ID:** 123e4567-e89b-12d3-a456-426614174000
**Generated:** 2024-01-15T10:30:00.000Z

## Storage Files Analysis

**Bucket:** property-images-v2
**Folder:** 123e4567-e89b-12d3-a456-426614174000/
**Files Found:** 3

| # | File Name | Size | Last Modified |
|---|-----------|------|---------------|
| 1 | image1.jpg | 245.67 KB | 2024-01-15T10:20:00.000Z |
| 2 | image2.jpg | 189.43 KB | 2024-01-15T10:21:00.000Z |
| 3 | thumbnail.jpg | 45.21 KB | 2024-01-15T10:22:00.000Z |

## Database Record

**Record Status:** ✅ Found

### Basic Information
- **Title:** Beautiful 2BHK Apartment
- **Status:** active
- **Category:** residential
- **Type:** rent
- **Created:** 2024-01-15T10:30:00.000Z
- **Updated:** 2024-01-15T10:35:00.000Z
- **Owner ID:** abc123...

### Property Details JSON
```json
{
  "meta": { ... },
  "flow": { ... },
  "details": { ... },
  "media": {
    "photos": {
      "images": ["image1.jpg", "image2.jpg", "thumbnail.jpg"]
    }
  }
}
```

### ImageFiles Analysis
**Location:** media.photos.images
**Count:** 3

**Individual Files:**
1. image1.jpg
2. image2.jpg
3. thumbnail.jpg

### Storage vs Database Comparison
- **Storage Files:** 3
- **Database Records:** 3
- **Status:** ✅ Match
```