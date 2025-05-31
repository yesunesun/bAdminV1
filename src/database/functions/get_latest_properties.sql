-- src/database/functions/get_latest_properties.sql
-- Version: 1.0.0
-- Last Modified: 01-06-2025 22:45 IST
-- Purpose: Get top 50 latest properties across all types sorted by creation date

-- =============================================================================
-- MAIN FUNCTION: Get latest properties (top 50, sorted by date)
-- =============================================================================
CREATE OR REPLACE FUNCTION get_latest_properties(
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    id UUID,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    property_type TEXT,
    flow_type TEXT,
    subtype TEXT,
    total_count BIGINT,
    title TEXT,
    price NUMERIC,
    city TEXT,
    state TEXT,
    area NUMERIC,
    owner_email TEXT,
    status TEXT,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    area_unit TEXT,
    land_type TEXT,
    primary_image TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_count BIGINT;
BEGIN
    -- Validate limit parameter
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 1000 THEN
        p_limit := 50;
    END IF;

    -- Get total count of active properties
    SELECT COUNT(*) INTO v_total_count
    FROM properties_v2 p
    WHERE p.status IS DISTINCT FROM 'deleted';

    -- Return results for all property types
    RETURN QUERY
    SELECT 
        -- MANDATORY CORE (8 fields)
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        
        -- Determine property type based on flow_type
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'residential_%' THEN 'residential'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'commercial_%' THEN 'commercial'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'land_%' THEN 'land'
            ELSE 'residential'
        END::TEXT as property_type,
        
        -- Flow type
        COALESCE(
            p.property_details->'flow'->>'flowType',
            p.property_details->>'flowType',
            'residential_rent'
        )::TEXT as flow_type,
        
        -- Subtype based on flow type
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_rent' THEN 'rent'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_sale' THEN 'sale'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_flatmates' THEN 'flatmates'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_pghostel' THEN 'pghostel'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'commercial_rent' THEN 'rent'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'commercial_sale' THEN 'sale'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'commercial_coworking' THEN 'coworking'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'land_sale' THEN 'sale'
            ELSE 'rent'
        END::TEXT as subtype,
        
        v_total_count as total_count,
        
        -- COMMON FIELDS (7 fields)
        -- Title (works for all property types)
        COALESCE(
            p.property_details->'flow'->>'title',
            p.property_details->'steps'->'res_rent_basic_details'->>'title',
            p.property_details->'steps'->'res_sale_basic_details'->>'title',
            p.property_details->'steps'->'res_flat_basic_details'->>'title',
            p.property_details->'steps'->'res_pg_basic_details'->>'title',
            p.property_details->'steps'->'com_rent_basic_details'->>'title',
            p.property_details->'steps'->'com_sale_basic_details'->>'title',
            p.property_details->'steps'->'com_cow_basic_details'->>'title',
            p.property_details->'steps'->'land_sale_basic_details'->>'title',
            p.property_details->'steps'->'land_basic_details'->>'title',
            p.property_details->'basicDetails'->>'title',
            'Property'
        )::TEXT as title,
        
        -- Price (works for all property types)
        COALESCE(
            safe_numeric(p.property_details->'flow'->>'price'),
            safe_numeric(p.property_details->'steps'->'res_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'expectedPrice'),
            safe_numeric(p.property_details->'steps'->'com_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'expectedPrice'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'price'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'salePrice'),
            safe_numeric(p.property_details->>'price')
        ) as price,
        
        -- City (works for all property types)
        COALESCE(
            p.property_details->'steps'->'res_rent_location'->>'city',
            p.property_details->'steps'->'res_sale_location'->>'city',
            p.property_details->'steps'->'res_flat_location'->>'city',
            p.property_details->'steps'->'res_pg_location'->>'city',
            p.property_details->'steps'->'com_rent_location'->>'city',
            p.property_details->'steps'->'com_sale_location'->>'city',
            p.property_details->'steps'->'com_cow_location'->>'city',
            p.property_details->'steps'->'land_sale_location'->>'city',
            p.property_details->'steps'->'land_location'->>'city',
            p.property_details->'location'->>'city'
        )::TEXT as city,
        
        -- State (works for all property types)
        COALESCE(
            p.property_details->'steps'->'res_rent_location'->>'state',
            p.property_details->'steps'->'res_sale_location'->>'state',
            p.property_details->'steps'->'res_flat_location'->>'state',
            p.property_details->'steps'->'res_pg_location'->>'state',
            p.property_details->'steps'->'com_rent_location'->>'state',
            p.property_details->'steps'->'com_sale_location'->>'state',
            p.property_details->'steps'->'com_cow_location'->>'state',
            p.property_details->'steps'->'land_sale_location'->>'state',
            p.property_details->'steps'->'land_location'->>'state',
            p.property_details->'location'->>'state'
        )::TEXT as state,
        
        -- Area (works for all property types)
        COALESCE(
            safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'squareFootage'),
            safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'builtUpArea'),
            safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'squareFootage'),
            safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'builtUpArea'),
            safe_numeric(p.property_details->'steps'->'com_rent_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'com_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area'),
            safe_numeric(p.property_details->'basicDetails'->>'area')
        ) as area,
        
        prof.email::TEXT as owner_email,
        COALESCE(p.status, 'active')::TEXT as status,
        
        -- TYPE-SPECIFIC FIELDS (4 fields)
        -- Bedrooms (only for residential)
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'residential_%' THEN
                COALESCE(
                    -- Extract from bhkType format (e.g., "2 BHK")
                    CASE 
                        WHEN p.property_details->'steps'->'res_rent_basic_details'->>'bhkType' ~ '^[0-9]+' 
                        THEN (regexp_match(p.property_details->'steps'->'res_rent_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
                        ELSE NULL 
                    END,
                    CASE 
                        WHEN p.property_details->'steps'->'res_sale_basic_details'->>'bhkType' ~ '^[0-9]+' 
                        THEN (regexp_match(p.property_details->'steps'->'res_sale_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
                        ELSE NULL 
                    END,
                    safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'bedrooms')::integer,
                    safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'bedrooms')::integer
                )
            ELSE NULL
        END as bedrooms,
        
        -- Bathrooms (only for residential)
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'residential_%' THEN
                COALESCE(
                    safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'basicDetails'->>'bathrooms')
                )
            ELSE NULL
        END as bathrooms,
        
        -- Area unit
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'land_%' THEN
                COALESCE(
                    p.property_details->'steps'->'land_sale_basic_details'->>'areaUnit',
                    p.property_details->'steps'->'land_basic_details'->>'areaUnit',
                    'sq_ft'
                )
            ELSE 'sq_ft'
        END::TEXT as area_unit,
        
        -- Land type (only for land properties)
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'land_%' THEN
                COALESCE(
                    p.property_details->'steps'->'land_sale_basic_details'->>'landType',
                    p.property_details->'steps'->'land_basic_details'->>'landType',
                    p.property_details->'basicDetails'->>'landType',
                    'agricultural'
                )
            ELSE NULL
        END::TEXT as land_type,
        
        -- Primary image (works for all property types)
        COALESCE(
            -- Check imageFiles array first
            CASE 
                WHEN p.property_details ? 'imageFiles' AND jsonb_array_length(p.property_details->'imageFiles') > 0 THEN
                    (p.property_details->'imageFiles'->0)->>'fileName'
                ELSE NULL 
            END,
            -- Check alternative locations
            p.property_details->'steps'->'image_upload'->>'primaryImage',
            p.property_details->'steps'->'images'->>'primaryImage',
            p.property_details->'media'->'photos'->>'primaryImage',
            p.property_details->'images'->>'primary'
        )::TEXT as primary_image
        
    FROM properties_v2 p
    LEFT JOIN profiles prof ON p.owner_id = prof.id
    WHERE p.status IS DISTINCT FROM 'deleted'
    ORDER BY p.created_at DESC
    LIMIT p_limit;
    
END;
$$;