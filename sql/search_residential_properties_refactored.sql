-- src/database/functions/search_residential_properties_refactored.sql
-- Version: 4.1.0
-- Last Modified: 01-06-2025 22:00 IST
-- Purpose: Refactored modular residential search with property type filtering

-- =============================================================================
-- HELPER FUNCTION 1: Extract BHK (Bedrooms) from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_bedrooms(property_details JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       -- Extract from bhkType format (e.g., "2 BHK")
       CASE 
           WHEN property_details->'steps'->'res_rent_basic_details'->>'bhkType' ~ '^[0-9]+' 
           THEN (regexp_match(property_details->'steps'->'res_rent_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
           ELSE NULL 
       END,
       CASE 
           WHEN property_details->'steps'->'res_sale_basic_details'->>'bhkType' ~ '^[0-9]+' 
           THEN (regexp_match(property_details->'steps'->'res_sale_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
           ELSE NULL 
       END,
       CASE 
           WHEN property_details->'steps'->'res_flat_basic_details'->>'bhkType' ~ '^[0-9]+' 
           THEN (regexp_match(property_details->'steps'->'res_flat_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
           ELSE NULL 
       END,
       CASE 
           WHEN property_details->'basicDetails'->>'bhkType' ~ '^[0-9]+' 
           THEN (regexp_match(property_details->'basicDetails'->>'bhkType', '^([0-9]+)'))[1]::integer
           ELSE NULL 
       END,
       -- Extract from bedrooms field
       CASE 
           WHEN property_details->'steps'->'res_rent_basic_details'->>'bedrooms' ~ '^[0-9]+' 
           THEN (regexp_match(property_details->'steps'->'res_rent_basic_details'->>'bedrooms', '^([0-9]+)'))[1]::integer
           ELSE NULL 
       END,
       CASE 
           WHEN property_details->'steps'->'res_sale_basic_details'->>'bedrooms' ~ '^[0-9]+' 
           THEN (regexp_match(property_details->'steps'->'res_sale_basic_details'->>'bedrooms', '^([0-9]+)'))[1]::integer
           ELSE NULL 
       END,
       -- Direct numeric values as fallback
       safe_numeric(property_details->'steps'->'res_rent_basic_details'->>'bedrooms')::integer,
       safe_numeric(property_details->'steps'->'res_sale_basic_details'->>'bedrooms')::integer,
       safe_numeric(property_details->'steps'->'res_flat_basic_details'->>'bedrooms')::integer,
       safe_numeric(property_details->'steps'->'res_pg_basic_details'->>'bedrooms')::integer,
       safe_numeric(property_details->'basicDetails'->>'bedrooms')::integer
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 2: Extract area from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_area(property_details JSONB)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       safe_numeric(property_details->'steps'->'res_rent_basic_details'->>'squareFootage'),
       safe_numeric(property_details->'steps'->'res_rent_basic_details'->>'builtUpArea'),
       safe_numeric(property_details->'steps'->'res_sale_basic_details'->>'squareFootage'),
       safe_numeric(property_details->'steps'->'res_sale_basic_details'->>'builtUpArea'),
       safe_numeric(property_details->'steps'->'res_flat_basic_details'->>'squareFootage'),
       safe_numeric(property_details->'steps'->'res_flat_basic_details'->>'builtUpArea'),
       safe_numeric(property_details->'steps'->'res_pg_basic_details'->>'area'),
       safe_numeric(property_details->'basicDetails'->>'builtUpArea'),
       safe_numeric(property_details->'basicDetails'->>'squareFootage')
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 3: Extract bathrooms from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_bathrooms(property_details JSONB)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       safe_numeric(property_details->'steps'->'res_rent_basic_details'->>'bathrooms'),
       safe_numeric(property_details->'steps'->'res_sale_basic_details'->>'bathrooms'),
       safe_numeric(property_details->'steps'->'res_flat_basic_details'->>'bathrooms'),
       safe_numeric(property_details->'steps'->'res_pg_basic_details'->>'bathrooms'),
       safe_numeric(property_details->'basicDetails'->>'bathrooms')
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 4: Extract price from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_price(property_details JSONB)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       safe_numeric(property_details->'flow'->>'price'),
       safe_numeric(property_details->'steps'->'res_rent_rental'->>'rentAmount'),
       safe_numeric(property_details->'steps'->'res_sale_sale_details'->>'salePrice'),
       safe_numeric(property_details->'steps'->'res_sale_sale_details'->>'expectedPrice'),
       safe_numeric(property_details->'steps'->'res_flat_flatmate_details'->>'rent'),
       safe_numeric(property_details->'steps'->'res_pg_pg_details'->>'rent'),
       safe_numeric(property_details->'steps'->'res_rent_rental'->>'monthlyRent'),
       safe_numeric(property_details->'steps'->'res_flat_flatmate_details'->>'monthlyRent'),
       safe_numeric(property_details->'steps'->'res_pg_pg_details'->>'monthlyRent'),
       safe_numeric(property_details->'rental'->>'rentAmount'),
       safe_numeric(property_details->'sale'->>'expectedPrice'),
       safe_numeric(property_details->>'price')
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 5: Extract title from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_title(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       property_details->'flow'->>'title',
       property_details->'steps'->'res_rent_basic_details'->>'title',
       property_details->'steps'->'res_sale_basic_details'->>'title',
       property_details->'steps'->'res_flat_basic_details'->>'title',
       property_details->'steps'->'res_pg_basic_details'->>'title',
       property_details->'basicDetails'->>'title',
       'Property'
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 6: Extract city from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_city(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       property_details->'steps'->'res_rent_location'->>'city',
       property_details->'steps'->'res_sale_location'->>'city',
       property_details->'steps'->'res_flat_location'->>'city',
       property_details->'steps'->'res_pg_location'->>'city',
       property_details->'location'->>'city'
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 7: Extract state from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_state(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       property_details->'steps'->'res_rent_location'->>'state',
       property_details->'steps'->'res_sale_location'->>'state',
       property_details->'steps'->'res_flat_location'->>'state',
       property_details->'steps'->'res_pg_location'->>'state',
       property_details->'location'->>'state'
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 8: Extract flow type from property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_flow_type(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       property_details->'flow'->>'flowType',
       property_details->>'flowType',
       'residential_rent'
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 9: Extract property type from property data (NEW)
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_residential_property_type(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN COALESCE(
       property_details->'steps'->'res_rent_basic_details'->>'propertyType',
       property_details->'steps'->'res_sale_basic_details'->>'propertyType',
       property_details->'steps'->'res_flat_basic_details'->>'propertyType',
       property_details->'steps'->'res_pg_basic_details'->>'propertyType',
       property_details->'basicDetails'->>'propertyType'
   );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 10: Convert flow type to subtype
-- =============================================================================
CREATE OR REPLACE FUNCTION flow_type_to_subtype(flow_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
   RETURN CASE 
       WHEN flow_type = 'residential_rent' THEN 'rent'
       WHEN flow_type = 'residential_sale' THEN 'sale'
       WHEN flow_type = 'residential_flatmates' THEN 'flatmates'
       WHEN flow_type = 'residential_pghostel' THEN 'pghostel'
       ELSE 'rent'
   END;
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 11: Check if property matches subtype filter
-- =============================================================================
CREATE OR REPLACE FUNCTION matches_residential_subtype(property_details JSONB, p_subtype TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
   flow_type TEXT;
BEGIN
   IF p_subtype IS NULL THEN
       RETURN TRUE;
   END IF;
   
   flow_type := extract_residential_flow_type(property_details);
   
   RETURN CASE 
       WHEN p_subtype = 'rent' THEN flow_type = 'residential_rent'
       WHEN p_subtype = 'sale' THEN flow_type = 'residential_sale'
       WHEN p_subtype = 'flatmates' THEN flow_type = 'residential_flatmates'
       WHEN p_subtype = 'pghostel' THEN flow_type = 'residential_pghostel'
       ELSE TRUE
   END;
END;
$$;

-- =============================================================================
-- MAIN FUNCTION: Search residential properties (refactored with property type)
-- =============================================================================
DROP FUNCTION IF EXISTS search_residential_properties CASCADE;

CREATE OR REPLACE FUNCTION search_residential_properties(
   p_subtype TEXT DEFAULT NULL,
   p_property_subtype TEXT DEFAULT NULL,
   p_search_query TEXT DEFAULT NULL,
   p_city TEXT DEFAULT NULL,
   p_state TEXT DEFAULT NULL,
   p_min_price NUMERIC DEFAULT NULL,
   p_max_price NUMERIC DEFAULT NULL,
   p_bedrooms INTEGER DEFAULT NULL,
   p_bathrooms NUMERIC DEFAULT NULL,
   p_area_min NUMERIC DEFAULT NULL,
   p_area_max NUMERIC DEFAULT NULL,
   p_limit INTEGER DEFAULT 50,
   p_offset INTEGER DEFAULT 0
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
   land_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
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

   -- Get total count using helper functions
   SELECT COUNT(*) INTO v_total_count
   FROM properties_v2 p
   WHERE p.status IS DISTINCT FROM 'deleted'
     AND extract_residential_flow_type(p.property_details) LIKE 'residential_%'
     AND matches_residential_subtype(p.property_details, p_subtype)
     AND (p_property_subtype IS NULL OR 
          extract_residential_property_type(p.property_details) ILIKE p_property_subtype)
     AND (p_search_query IS NULL OR 
          extract_residential_title(p.property_details) ILIKE '%' || p_search_query || '%')
     AND (p_city IS NULL OR 
          extract_residential_city(p.property_details) ILIKE '%' || p_city || '%')
     AND (p_state IS NULL OR 
          extract_residential_state(p.property_details) ILIKE '%' || p_state || '%')
     AND (p_min_price IS NULL OR 
          extract_residential_price(p.property_details) >= p_min_price)
     AND (p_max_price IS NULL OR 
          extract_residential_price(p.property_details) <= p_max_price)
     AND (p_bedrooms IS NULL OR 
          extract_residential_bedrooms(p.property_details) = p_bedrooms)
     AND (p_bathrooms IS NULL OR 
          extract_residential_bathrooms(p.property_details) >= p_bathrooms)
     AND (p_area_min IS NULL OR 
          extract_residential_area(p.property_details) >= p_area_min)
     AND (p_area_max IS NULL OR 
          extract_residential_area(p.property_details) <= p_area_max);

   -- Return results using helper functions
   RETURN QUERY
   SELECT 
       -- MANDATORY CORE (8 fields)
       p.id,
       p.owner_id,
       p.created_at,
       p.updated_at,
       'residential'::TEXT as property_type,
       extract_residential_flow_type(p.property_details)::TEXT as flow_type,
       flow_type_to_subtype(extract_residential_flow_type(p.property_details))::TEXT as subtype,
       v_total_count as total_count,
       
       -- COMMON FIELDS (7 fields) - Using helper functions
       extract_residential_title(p.property_details)::TEXT as title,
       extract_residential_price(p.property_details) as price,
       extract_residential_city(p.property_details)::TEXT as city,
       extract_residential_state(p.property_details)::TEXT as state,
       extract_residential_area(p.property_details) as area,
       prof.email::TEXT as owner_email,
       COALESCE(p.status, 'active')::TEXT as status,
       
       -- TYPE-SPECIFIC FIELDS (4 fields) - Using helper functions
       extract_residential_bedrooms(p.property_details) as bedrooms,
       extract_residential_bathrooms(p.property_details) as bathrooms,
       'sq_ft'::TEXT as area_unit,
       NULL::TEXT as land_type
       
   FROM properties_v2 p
   LEFT JOIN profiles prof ON p.owner_id = prof.id
   WHERE p.status IS DISTINCT FROM 'deleted'
     AND extract_residential_flow_type(p.property_details) LIKE 'residential_%'
     AND matches_residential_subtype(p.property_details, p_subtype)
     AND (p_property_subtype IS NULL OR 
          extract_residential_property_type(p.property_details) ILIKE p_property_subtype)
     AND (p_search_query IS NULL OR 
          extract_residential_title(p.property_details) ILIKE '%' || p_search_query || '%')
     AND (p_city IS NULL OR 
          extract_residential_city(p.property_details) ILIKE '%' || p_city || '%')
     AND (p_state IS NULL OR 
          extract_residential_state(p.property_details) ILIKE '%' || p_state || '%')
     AND (p_min_price IS NULL OR 
          extract_residential_price(p.property_details) >= p_min_price)
     AND (p_max_price IS NULL OR 
          extract_residential_price(p.property_details) <= p_max_price)
     AND (p_bedrooms IS NULL OR 
          extract_residential_bedrooms(p.property_details) = p_bedrooms)
     AND (p_bathrooms IS NULL OR 
          extract_residential_bathrooms(p.property_details) >= p_bathrooms)
     AND (p_area_min IS NULL OR 
          extract_residential_area(p.property_details) >= p_area_min)
     AND (p_area_max IS NULL OR 
          extract_residential_area(p.property_details) <= p_area_max)
   ORDER BY p.created_at DESC
   LIMIT p_limit OFFSET p_offset;
   
END;
$$;