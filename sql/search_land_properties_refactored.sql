-- Updated search_land_properties function - Only uses expectedPrice for land properties
-- Version: 2.0.0
-- Last Modified: 01-06-2025 21:45 IST
-- Purpose: Extract price ONLY from expectedPrice field for land properties

CREATE OR REPLACE FUNCTION public.search_land_properties(
    p_search_query text DEFAULT NULL,
    p_min_price numeric DEFAULT NULL,
    p_max_price numeric DEFAULT NULL,
    p_city text DEFAULT NULL,
    p_state text DEFAULT NULL,
    p_area_min numeric DEFAULT NULL,
    p_area_max numeric DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
) RETURNS TABLE(
    id uuid,
    owner_id uuid,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    property_type text,
    flow_type text,
    subtype text,
    total_count bigint,
    title text,
    price numeric,
    city text,
    state text,
    area numeric,
    owner_email text,
    status text,
    bedrooms integer,
    bathrooms numeric,
    area_unit text,
    land_type text
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_count BIGINT;
BEGIN
    -- Validate parameters
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 1000 THEN
        p_limit := 50;
    END IF;
    
    IF p_offset IS NULL OR p_offset < 0 THEN
        p_offset := 0;
    END IF;

    -- Get total count first - ONLY using expectedPrice
    SELECT COUNT(*) INTO v_total_count
    FROM properties_v2 p
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND (
          COALESCE(
              p.property_details->>'flow_type',
              p.property_details->'flow'->>'flowType',
              p.property_details->'meta'->>'flow_type'
          ) = 'land_sale'
          OR
          COALESCE(
              p.property_details->>'flow_type',
              p.property_details->'flow'->>'flowType',
              p.property_details->'meta'->>'flow_type'
          ) LIKE '%land%'
      )
      AND (p_search_query IS NULL OR 
           COALESCE(
               p.property_details->'flow'->>'title',
               p.property_details->'steps'->'land_sale_basic_details'->>'title',
               p.property_details->'steps'->'land_basic_details'->>'title',
               'Land Property'
           ) ILIKE '%' || p_search_query || '%')
      AND (p_city IS NULL OR 
           COALESCE(
               p.property_details->'steps'->'land_sale_location'->>'city',
               p.property_details->'steps'->'land_location'->>'city',
               p.property_details->'steps'->'location_details'->>'city'
           ) ILIKE '%' || p_city || '%')
      AND (p_state IS NULL OR 
           COALESCE(
               p.property_details->'steps'->'land_sale_location'->>'state',
               p.property_details->'steps'->'land_location'->>'state',
               p.property_details->'steps'->'location_details'->>'state'
           ) ILIKE '%' || p_state || '%')
      -- CRITICAL: Only use expectedPrice for price filtering
      AND (p_min_price IS NULL OR 
           safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'expectedPrice') >= p_min_price)
      AND (p_max_price IS NULL OR 
           safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'expectedPrice') <= p_max_price)
      AND (p_area_min IS NULL OR 
           COALESCE(
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'totalArea'),
               safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area')
           ) >= p_area_min)
      AND (p_area_max IS NULL OR 
           COALESCE(
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'totalArea'),
               safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area')
           ) <= p_area_max);

    -- Return the results - ONLY using expectedPrice for price field
    RETURN QUERY
    SELECT 
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        'land'::TEXT as property_type,
        COALESCE(
            p.property_details->>'flow_type',
            p.property_details->'flow'->>'flowType',
            p.property_details->'meta'->>'flow_type',
            'land_sale'
        )::TEXT as flow_type,
        'sale'::TEXT as subtype,
        v_total_count as total_count,
        COALESCE(
            p.property_details->'flow'->>'title',
            p.property_details->'steps'->'land_sale_basic_details'->>'title',
            p.property_details->'steps'->'land_basic_details'->>'title',
            p.property_details->'steps'->'property_details'->>'title',
            'Land Property'
        )::TEXT as title,
        -- CRITICAL: Price comes ONLY from expectedPrice field
        safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'expectedPrice') as price,
        COALESCE(
            p.property_details->'steps'->'land_sale_location'->>'city',
            p.property_details->'steps'->'land_location'->>'city',
            p.property_details->'steps'->'location_details'->>'city',
            p.property_details->'flow'->>'city',
            p.property_details->>'city'
        )::TEXT as city,
        COALESCE(
            p.property_details->'steps'->'land_sale_location'->>'state',
            p.property_details->'steps'->'land_location'->>'state',
            p.property_details->'steps'->'location_details'->>'state',
            p.property_details->'flow'->>'state',
            p.property_details->>'state'
        )::TEXT as state,
        COALESCE(
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'totalArea'),
            safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_basic_details'->>'totalArea'),
            safe_numeric(p.property_details->'steps'->'property_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'property_details'->>'totalArea'),
            safe_numeric(p.property_details->'flow'->>'area'),
            safe_numeric(p.property_details->>'area'),
            safe_numeric(p.property_details->>'totalArea')
        ) as area,
        prof.email::TEXT as owner_email,
        COALESCE(p.status, 'active')::TEXT as status,
        NULL::INTEGER as bedrooms,
        NULL::NUMERIC as bathrooms,
        COALESCE(
            p.property_details->'steps'->'land_sale_basic_details'->>'areaUnit',
            p.property_details->'steps'->'land_basic_details'->>'areaUnit',
            p.property_details->'steps'->'property_details'->>'areaUnit',
            p.property_details->'flow'->>'areaUnit',
            p.property_details->>'areaUnit',
            'sq_ft'
        )::TEXT as area_unit,
        COALESCE(
            p.property_details->'steps'->'land_sale_basic_details'->>'landType',
            p.property_details->'steps'->'land_basic_details'->>'landType',
            p.property_details->'steps'->'land_sale_basic_details'->>'propertyType',
            p.property_details->'steps'->'property_details'->>'landType',
            p.property_details->'flow'->>'landType',
            p.property_details->>'landType',
            'agricultural'
        )::TEXT as land_type
    FROM properties_v2 p
    LEFT JOIN profiles prof ON p.owner_id = prof.id
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND (
          COALESCE(
              p.property_details->>'flow_type',
              p.property_details->'flow'->>'flowType',
              p.property_details->'meta'->>'flow_type'
          ) = 'land_sale'
          OR
          COALESCE(
              p.property_details->>'flow_type',
              p.property_details->'flow'->>'flowType',
              p.property_details->'meta'->>'flow_type'
          ) LIKE '%land%'
      )
      AND (p_search_query IS NULL OR 
           COALESCE(
               p.property_details->'flow'->>'title',
               p.property_details->'steps'->'land_sale_basic_details'->>'title',
               p.property_details->'steps'->'land_basic_details'->>'title',
               'Land Property'
           ) ILIKE '%' || p_search_query || '%')
      AND (p_city IS NULL OR 
           COALESCE(
               p.property_details->'steps'->'land_sale_location'->>'city',
               p.property_details->'steps'->'land_location'->>'city',
               p.property_details->'steps'->'location_details'->>'city'
           ) ILIKE '%' || p_city || '%')
      AND (p_state IS NULL OR 
           COALESCE(
               p.property_details->'steps'->'land_sale_location'->>'state',
               p.property_details->'steps'->'land_location'->>'state',
               p.property_details->'steps'->'location_details'->>'state'
           ) ILIKE '%' || p_state || '%')
      -- CRITICAL: Only use expectedPrice for price filtering in WHERE clause
      AND (p_min_price IS NULL OR 
           safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'expectedPrice') >= p_min_price)
      AND (p_max_price IS NULL OR 
           safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'expectedPrice') <= p_max_price)
      AND (p_area_min IS NULL OR 
           COALESCE(
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'totalArea'),
               safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area')
           ) >= p_area_min)
      AND (p_area_max IS NULL OR 
           COALESCE(
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
               safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'totalArea'),
               safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area')
           ) <= p_area_max)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;