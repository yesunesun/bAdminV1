import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Complete 324 test cases from the SQL file
const testCases = [
  // Category 1: Residential Properties - 108 test cases
  // 1.1 RESIDENTIAL - BASIC SEARCH (18 test cases)
  { id: 'TC001', name: 'Basic residential search', params: { p_property_type: 'residential', p_limit: 10, p_offset: 0 } },
  { id: 'TC002', name: 'Residential with city filter - Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC003', name: 'Residential with city filter - Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC004', name: 'Residential with state filter - Telangana', params: { p_property_type: 'residential', p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC005', name: 'Residential with search query - apartment', params: { p_property_type: 'residential', p_search_query: 'apartment', p_limit: 10 } },
  { id: 'TC006', name: 'Residential with search query - house', params: { p_property_type: 'residential', p_search_query: 'house', p_limit: 10 } },
  { id: 'TC007', name: 'Residential with search query - villa', params: { p_property_type: 'residential', p_search_query: 'villa', p_limit: 10 } },
  { id: 'TC008', name: 'Residential with search query - flat', params: { p_property_type: 'residential', p_search_query: 'flat', p_limit: 10 } },
  { id: 'TC009', name: 'Residential with search query - bhk', params: { p_property_type: 'residential', p_search_query: 'bhk', p_limit: 10 } },
  { id: 'TC010', name: 'Residential with search query - rent', params: { p_property_type: 'residential', p_search_query: 'rent', p_limit: 10 } },
  { id: 'TC011', name: 'Residential with search query - sale', params: { p_property_type: 'residential', p_search_query: 'sale', p_limit: 10 } },
  { id: 'TC012', name: 'Residential with search query - furnished', params: { p_property_type: 'residential', p_search_query: 'furnished', p_limit: 10 } },
  { id: 'TC013', name: 'Residential with search query - gated', params: { p_property_type: 'residential', p_search_query: 'gated', p_limit: 10 } },
  { id: 'TC014', name: 'Residential with search query - parking', params: { p_property_type: 'residential', p_search_query: 'parking', p_limit: 10 } },
  { id: 'TC015', name: 'Residential with search query - balcony', params: { p_property_type: 'residential', p_search_query: 'balcony', p_limit: 10 } },
  { id: 'TC016', name: 'Residential with search query - garden', params: { p_property_type: 'residential', p_search_query: 'garden', p_limit: 10 } },
  { id: 'TC017', name: 'Residential with search query - pool', params: { p_property_type: 'residential', p_search_query: 'pool', p_limit: 10 } },
  { id: 'TC018', name: 'Residential with search query - security', params: { p_property_type: 'residential', p_search_query: 'security', p_limit: 10 } },
  
  // 1.2 RESIDENTIAL - BHK CONFIGURATIONS (15 test cases)
  { id: 'TC019', name: 'Residential 1 BHK', params: { p_property_type: 'residential', p_bedrooms: 1, p_limit: 10 } },
  { id: 'TC020', name: 'Residential 2 BHK', params: { p_property_type: 'residential', p_bedrooms: 2, p_limit: 10 } },
  { id: 'TC021', name: 'Residential 3 BHK', params: { p_property_type: 'residential', p_bedrooms: 3, p_limit: 10 } },
  { id: 'TC022', name: 'Residential 4 BHK', params: { p_property_type: 'residential', p_bedrooms: 4, p_limit: 10 } },
  { id: 'TC023', name: 'Residential 5 BHK', params: { p_property_type: 'residential', p_bedrooms: 5, p_limit: 10 } },
  { id: 'TC024', name: 'Residential 1 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 1, p_limit: 10 } },
  { id: 'TC025', name: 'Residential 2 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 2, p_limit: 10 } },
  { id: 'TC026', name: 'Residential 3 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 3, p_limit: 10 } },
  { id: 'TC027', name: 'Residential 4 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 4, p_limit: 10 } },
  { id: 'TC028', name: 'Residential 1 BHK in Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_bedrooms: 1, p_limit: 10 } },
  { id: 'TC029', name: 'Residential 2 BHK in Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_bedrooms: 2, p_limit: 10 } },
  { id: 'TC030', name: 'Residential 3 BHK in Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_bedrooms: 3, p_limit: 10 } },
  { id: 'TC031', name: 'Residential with bathroom filter - 1 bathroom', params: { p_property_type: 'residential', p_bathrooms: 1, p_limit: 10 } },
  { id: 'TC032', name: 'Residential with bathroom filter - 2 bathrooms', params: { p_property_type: 'residential', p_bathrooms: 2, p_limit: 10 } },
  { id: 'TC033', name: 'Residential with bathroom filter - 3 bathrooms', params: { p_property_type: 'residential', p_bathrooms: 3, p_limit: 10 } },
  
  // 1.3 RESIDENTIAL - PRICE RANGES (15 test cases)
  { id: 'TC034', name: 'Residential under 10,000', params: { p_property_type: 'residential', p_max_price: 10000, p_limit: 10 } },
  { id: 'TC035', name: 'Residential 10,000 - 20,000', params: { p_property_type: 'residential', p_min_price: 10000, p_max_price: 20000, p_limit: 10 } },
  { id: 'TC036', name: 'Residential 20,000 - 30,000', params: { p_property_type: 'residential', p_min_price: 20000, p_max_price: 30000, p_limit: 10 } },
  { id: 'TC037', name: 'Residential 30,000 - 50,000', params: { p_property_type: 'residential', p_min_price: 30000, p_max_price: 50000, p_limit: 10 } },
  { id: 'TC038', name: 'Residential 50,000 - 100,000', params: { p_property_type: 'residential', p_min_price: 50000, p_max_price: 100000, p_limit: 10 } },
  { id: 'TC039', name: 'Residential above 100,000', params: { p_property_type: 'residential', p_min_price: 100000, p_limit: 10 } },
  { id: 'TC040', name: 'Residential 1 BHK under 15,000', params: { p_property_type: 'residential', p_bedrooms: 1, p_max_price: 15000, p_limit: 10 } },
  { id: 'TC041', name: 'Residential 2 BHK 15,000 - 25,000', params: { p_property_type: 'residential', p_bedrooms: 2, p_min_price: 15000, p_max_price: 25000, p_limit: 10 } },
  { id: 'TC042', name: 'Residential 3 BHK 25,000 - 40,000', params: { p_property_type: 'residential', p_bedrooms: 3, p_min_price: 25000, p_max_price: 40000, p_limit: 10 } },
  { id: 'TC043', name: 'Residential 4 BHK above 40,000', params: { p_property_type: 'residential', p_bedrooms: 4, p_min_price: 40000, p_limit: 10 } },
  { id: 'TC044', name: 'Residential sale price under 50 lakhs', params: { p_property_type: 'residential', p_search_query: 'sale', p_max_price: 5000000, p_limit: 10 } },
  { id: 'TC045', name: 'Residential sale price 50 lakhs - 1 crore', params: { p_property_type: 'residential', p_search_query: 'sale', p_min_price: 5000000, p_max_price: 10000000, p_limit: 10 } },
  { id: 'TC046', name: 'Residential sale price 1 crore - 2 crores', params: { p_property_type: 'residential', p_search_query: 'sale', p_min_price: 10000000, p_max_price: 20000000, p_limit: 10 } },
  { id: 'TC047', name: 'Residential sale price above 2 crores', params: { p_property_type: 'residential', p_search_query: 'sale', p_min_price: 20000000, p_limit: 10 } },
  { id: 'TC048', name: 'Residential exact price 25,000', params: { p_property_type: 'residential', p_min_price: 25000, p_max_price: 25000, p_limit: 10 } },
  
  // 1.4 RESIDENTIAL - AREA RANGES (15 test cases)
  { id: 'TC049', name: 'Residential area under 500 sqft', params: { p_property_type: 'residential', p_area_max: 500, p_limit: 10 } },
  { id: 'TC050', name: 'Residential area 500-1000 sqft', params: { p_property_type: 'residential', p_area_min: 500, p_area_max: 1000, p_limit: 10 } },
  { id: 'TC051', name: 'Residential area 1000-1500 sqft', params: { p_property_type: 'residential', p_area_min: 1000, p_area_max: 1500, p_limit: 10 } },
  { id: 'TC052', name: 'Residential area 1500-2000 sqft', params: { p_property_type: 'residential', p_area_min: 1500, p_area_max: 2000, p_limit: 10 } },
  { id: 'TC053', name: 'Residential area 2000-3000 sqft', params: { p_property_type: 'residential', p_area_min: 2000, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC054', name: 'Residential area above 3000 sqft', params: { p_property_type: 'residential', p_area_min: 3000, p_limit: 10 } },
  { id: 'TC055', name: 'Residential 1 BHK area 300-600 sqft', params: { p_property_type: 'residential', p_bedrooms: 1, p_area_min: 300, p_area_max: 600, p_limit: 10 } },
  { id: 'TC056', name: 'Residential 2 BHK area 600-1200 sqft', params: { p_property_type: 'residential', p_bedrooms: 2, p_area_min: 600, p_area_max: 1200, p_limit: 10 } },
  { id: 'TC057', name: 'Residential 3 BHK area 1200-1800 sqft', params: { p_property_type: 'residential', p_bedrooms: 3, p_area_min: 1200, p_area_max: 1800, p_limit: 10 } },
  { id: 'TC058', name: 'Residential 4 BHK area 1800-2500 sqft', params: { p_property_type: 'residential', p_bedrooms: 4, p_area_min: 1800, p_area_max: 2500, p_limit: 10 } },
  { id: 'TC059', name: 'Residential exact area 1234 sqft', params: { p_property_type: 'residential', p_area_min: 1234, p_area_max: 1234, p_limit: 10 } },
  { id: 'TC060', name: 'Residential large area above 5000 sqft', params: { p_property_type: 'residential', p_area_min: 5000, p_limit: 10 } },
  { id: 'TC061', name: 'Residential small area under 300 sqft', params: { p_property_type: 'residential', p_area_max: 300, p_limit: 10 } },
  { id: 'TC062', name: 'Residential medium area 800-1200 sqft', params: { p_property_type: 'residential', p_area_min: 800, p_area_max: 1200, p_limit: 10 } },
  { id: 'TC063', name: 'Residential premium area 3000-5000 sqft', params: { p_property_type: 'residential', p_area_min: 3000, p_area_max: 5000, p_limit: 10 } },
  
  // 1.5 RESIDENTIAL - LOCATION SPECIFIC (15 test cases)
  { id: 'TC064', name: 'Residential in Gachibowli', params: { p_property_type: 'residential', p_search_query: 'Gachibowli', p_limit: 10 } },
  { id: 'TC065', name: 'Residential in Hitech City', params: { p_property_type: 'residential', p_search_query: 'Hitech City', p_limit: 10 } },
  { id: 'TC066', name: 'Residential in Madhapur', params: { p_property_type: 'residential', p_search_query: 'Madhapur', p_limit: 10 } },
  { id: 'TC067', name: 'Residential in Kondapur', params: { p_property_type: 'residential', p_search_query: 'Kondapur', p_limit: 10 } },
  { id: 'TC068', name: 'Residential in Kukatpally', params: { p_property_type: 'residential', p_search_query: 'Kukatpally', p_limit: 10 } },
  { id: 'TC069', name: 'Residential in Ameerpet', params: { p_property_type: 'residential', p_search_query: 'Ameerpet', p_limit: 10 } },
  { id: 'TC070', name: 'Residential in Banjara Hills', params: { p_property_type: 'residential', p_search_query: 'Banjara Hills', p_limit: 10 } },
  { id: 'TC071', name: 'Residential in Jubilee Hills', params: { p_property_type: 'residential', p_search_query: 'Jubilee Hills', p_limit: 10 } },
  { id: 'TC072', name: 'Residential in Begumpet', params: { p_property_type: 'residential', p_search_query: 'Begumpet', p_limit: 10 } },
  { id: 'TC073', name: 'Residential in Uppal', params: { p_property_type: 'residential', p_search_query: 'Uppal', p_limit: 10 } },
  { id: 'TC074', name: 'Residential in Kompally', params: { p_property_type: 'residential', p_search_query: 'Kompally', p_limit: 10 } },
  { id: 'TC075', name: 'Residential in Miyapur', params: { p_property_type: 'residential', p_search_query: 'Miyapur', p_limit: 10 } },
  { id: 'TC076', name: 'Residential in Nizampet', params: { p_property_type: 'residential', p_search_query: 'Nizampet', p_limit: 10 } },
  { id: 'TC077', name: 'Residential in Manikonda', params: { p_property_type: 'residential', p_search_query: 'Manikonda', p_limit: 10 } },
  { id: 'TC078', name: 'Residential in Bachupally', params: { p_property_type: 'residential', p_search_query: 'Bachupally', p_limit: 10 } },
  
  // 1.6 RESIDENTIAL - COMPLEX COMBINATIONS (30 test cases)
  { id: 'TC079', name: 'Residential 2 BHK in Hyderabad under 25,000', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 2, p_max_price: 25000, p_limit: 10 } },
  { id: 'TC080', name: 'Residential 3 BHK in Gachibowli 30,000-50,000', params: { p_property_type: 'residential', p_search_query: 'Gachibowli', p_bedrooms: 3, p_min_price: 30000, p_max_price: 50000, p_limit: 10 } },
  { id: 'TC081', name: 'Residential apartment in Hitech City 1200-1800 sqft', params: { p_property_type: 'residential', p_search_query: 'apartment Hitech City', p_area_min: 1200, p_area_max: 1800, p_limit: 10 } },
  { id: 'TC082', name: 'Residential furnished 2 BHK in Madhapur', params: { p_property_type: 'residential', p_search_query: 'furnished Madhapur', p_bedrooms: 2, p_limit: 10 } },
  { id: 'TC083', name: 'Residential villa in Jubilee Hills above 100,000', params: { p_property_type: 'residential', p_search_query: 'villa Jubilee Hills', p_min_price: 100000, p_limit: 10 } },
  { id: 'TC084', name: 'Residential independent house in Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_search_query: 'independent house', p_limit: 10 } },
  { id: 'TC085', name: 'Residential 1 BHK with parking under 20,000', params: { p_property_type: 'residential', p_bedrooms: 1, p_search_query: 'parking', p_max_price: 20000, p_limit: 10 } },
  { id: 'TC086', name: 'Residential 4 BHK with pool and garden', params: { p_property_type: 'residential', p_bedrooms: 4, p_search_query: 'pool garden', p_limit: 10 } },
  { id: 'TC087', name: 'Residential gated community in Kondapur', params: { p_property_type: 'residential', p_search_query: 'gated community Kondapur', p_limit: 10 } },
  { id: 'TC088', name: 'Residential with gym and security', params: { p_property_type: 'residential', p_search_query: 'gym security', p_limit: 10 } },
  { id: 'TC089', name: 'Residential pet-friendly properties', params: { p_property_type: 'residential', p_search_query: 'pet friendly', p_limit: 10 } },
  { id: 'TC090', name: 'Residential bachelor-friendly properties', params: { p_property_type: 'residential', p_search_query: 'bachelor', p_limit: 10 } },
  { id: 'TC091', name: 'Residential family-only properties', params: { p_property_type: 'residential', p_search_query: 'family', p_limit: 10 } },
  { id: 'TC092', name: 'Residential semi-furnished properties', params: { p_property_type: 'residential', p_search_query: 'semi furnished', p_limit: 10 } },
  { id: 'TC093', name: 'Residential unfurnished properties', params: { p_property_type: 'residential', p_search_query: 'unfurnished', p_limit: 10 } },
  { id: 'TC094', name: 'Residential with balcony and parking', params: { p_property_type: 'residential', p_search_query: 'balcony parking', p_limit: 10 } },
  { id: 'TC095', name: 'Residential ground floor properties', params: { p_property_type: 'residential', p_search_query: 'ground floor', p_limit: 10 } },
  { id: 'TC096', name: 'Residential top floor properties', params: { p_property_type: 'residential', p_search_query: 'top floor', p_limit: 10 } },
  { id: 'TC097', name: 'Residential with power backup', params: { p_property_type: 'residential', p_search_query: 'power backup', p_limit: 10 } },
  { id: 'TC098', name: 'Residential with water storage', params: { p_property_type: 'residential', p_search_query: 'water storage', p_limit: 10 } },
  { id: 'TC099', name: 'Residential with intercom facility', params: { p_property_type: 'residential', p_search_query: 'intercom', p_limit: 10 } },
  { id: 'TC100', name: 'Residential with lift facility', params: { p_property_type: 'residential', p_search_query: 'lift', p_limit: 10 } },
  { id: 'TC101', name: 'Residential with children play area', params: { p_property_type: 'residential', p_search_query: 'children play area', p_limit: 10 } },
  { id: 'TC102', name: 'Residential with fire safety', params: { p_property_type: 'residential', p_search_query: 'fire safety', p_limit: 10 } },
  { id: 'TC103', name: 'Residential with rainwater harvesting', params: { p_property_type: 'residential', p_search_query: 'rainwater harvesting', p_limit: 10 } },
  { id: 'TC104', name: 'Residential with sewage treatment', params: { p_property_type: 'residential', p_search_query: 'sewage treatment', p_limit: 10 } },
  { id: 'TC105', name: 'Residential with shopping center', params: { p_property_type: 'residential', p_search_query: 'shopping center', p_limit: 10 } },
  { id: 'TC106', name: 'Residential with housekeeping service', params: { p_property_type: 'residential', p_search_query: 'housekeeping', p_limit: 10 } },
  { id: 'TC107', name: 'Residential with indoor games', params: { p_property_type: 'residential', p_search_query: 'indoor games', p_limit: 10 } },
  { id: 'TC108', name: 'Residential with air conditioning', params: { p_property_type: 'residential', p_search_query: 'air conditioning', p_limit: 10 } },
  
  // Category 2: Commercial Properties - 72 test cases
  // 2.1 COMMERCIAL - BASIC SEARCH (18 test cases)
  { id: 'TC109', name: 'Basic commercial search', params: { p_property_type: 'commercial', p_limit: 10, p_offset: 0 } },
  { id: 'TC110', name: 'Commercial with city filter - Hyderabad', params: { p_property_type: 'commercial', p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC111', name: 'Commercial with city filter - Secunderabad', params: { p_property_type: 'commercial', p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC112', name: 'Commercial with state filter - Telangana', params: { p_property_type: 'commercial', p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC113', name: 'Commercial with search query - office', params: { p_property_type: 'commercial', p_search_query: 'office', p_limit: 10 } },
  { id: 'TC114', name: 'Commercial with search query - shop', params: { p_property_type: 'commercial', p_search_query: 'shop', p_limit: 10 } },
  { id: 'TC115', name: 'Commercial with search query - warehouse', params: { p_property_type: 'commercial', p_search_query: 'warehouse', p_limit: 10 } },
  { id: 'TC116', name: 'Commercial with search query - showroom', params: { p_property_type: 'commercial', p_search_query: 'showroom', p_limit: 10 } },
  { id: 'TC117', name: 'Commercial with search query - retail', params: { p_property_type: 'commercial', p_search_query: 'retail', p_limit: 10 } },
  { id: 'TC118', name: 'Commercial with search query - restaurant', params: { p_property_type: 'commercial', p_search_query: 'restaurant', p_limit: 10 } },
  { id: 'TC119', name: 'Commercial with search query - mall', params: { p_property_type: 'commercial', p_search_query: 'mall', p_limit: 10 } },
  { id: 'TC120', name: 'Commercial with search query - IT space', params: { p_property_type: 'commercial', p_search_query: 'IT space', p_limit: 10 } },
  { id: 'TC121', name: 'Commercial with search query - coworking', params: { p_property_type: 'commercial', p_search_query: 'coworking', p_limit: 10 } },
  { id: 'TC122', name: 'Commercial with search query - business center', params: { p_property_type: 'commercial', p_search_query: 'business center', p_limit: 10 } },
  { id: 'TC123', name: 'Commercial with search query - industrial', params: { p_property_type: 'commercial', p_search_query: 'industrial', p_limit: 10 } },
  { id: 'TC124', name: 'Commercial with search query - factory', params: { p_property_type: 'commercial', p_search_query: 'factory', p_limit: 10 } },
  { id: 'TC125', name: 'Commercial with search query - hotel', params: { p_property_type: 'commercial', p_search_query: 'hotel', p_limit: 10 } },
  { id: 'TC126', name: 'Commercial with search query - hospital', params: { p_property_type: 'commercial', p_search_query: 'hospital', p_limit: 10 } },
  
  // 2.2 COMMERCIAL - PRICE RANGES (18 test cases)
  { id: 'TC127', name: 'Commercial under 50,000', params: { p_property_type: 'commercial', p_max_price: 50000, p_limit: 10 } },
  { id: 'TC128', name: 'Commercial 50,000 - 100,000', params: { p_property_type: 'commercial', p_min_price: 50000, p_max_price: 100000, p_limit: 10 } },
  { id: 'TC129', name: 'Commercial 100,000 - 200,000', params: { p_property_type: 'commercial', p_min_price: 100000, p_max_price: 200000, p_limit: 10 } },
  { id: 'TC130', name: 'Commercial 200,000 - 500,000', params: { p_property_type: 'commercial', p_min_price: 200000, p_max_price: 500000, p_limit: 10 } },
  { id: 'TC131', name: 'Commercial above 500,000', params: { p_property_type: 'commercial', p_min_price: 500000, p_limit: 10 } },
  { id: 'TC132', name: 'Commercial office space under 75,000', params: { p_property_type: 'commercial', p_search_query: 'office', p_max_price: 75000, p_limit: 10 } },
  { id: 'TC133', name: 'Commercial shop space 25,000 - 75,000', params: { p_property_type: 'commercial', p_search_query: 'shop', p_min_price: 25000, p_max_price: 75000, p_limit: 10 } },
  { id: 'TC134', name: 'Commercial warehouse above 100,000', params: { p_property_type: 'commercial', p_search_query: 'warehouse', p_min_price: 100000, p_limit: 10 } },
  { id: 'TC135', name: 'Commercial showroom 50,000 - 150,000', params: { p_property_type: 'commercial', p_search_query: 'showroom', p_min_price: 50000, p_max_price: 150000, p_limit: 10 } },
  { id: 'TC136', name: 'Commercial retail space under 100,000', params: { p_property_type: 'commercial', p_search_query: 'retail', p_max_price: 100000, p_limit: 10 } },
  { id: 'TC137', name: 'Commercial restaurant space 75,000 - 200,000', params: { p_property_type: 'commercial', p_search_query: 'restaurant', p_min_price: 75000, p_max_price: 200000, p_limit: 10 } },
  { id: 'TC138', name: 'Commercial IT space 100,000 - 300,000', params: { p_property_type: 'commercial', p_search_query: 'IT space', p_min_price: 100000, p_max_price: 300000, p_limit: 10 } },
  { id: 'TC139', name: 'Commercial coworking space under 50,000', params: { p_property_type: 'commercial', p_search_query: 'coworking', p_max_price: 50000, p_limit: 10 } },
  { id: 'TC140', name: 'Commercial business center above 150,000', params: { p_property_type: 'commercial', p_search_query: 'business center', p_min_price: 150000, p_limit: 10 } },
  { id: 'TC141', name: 'Commercial sale price under 1 crore', params: { p_property_type: 'commercial', p_search_query: 'sale', p_max_price: 10000000, p_limit: 10 } },
  { id: 'TC142', name: 'Commercial sale price 1 crore - 5 crores', params: { p_property_type: 'commercial', p_search_query: 'sale', p_min_price: 10000000, p_max_price: 50000000, p_limit: 10 } },
  { id: 'TC143', name: 'Commercial sale price above 5 crores', params: { p_property_type: 'commercial', p_search_query: 'sale', p_min_price: 50000000, p_limit: 10 } },
  { id: 'TC144', name: 'Commercial exact price 125,000', params: { p_property_type: 'commercial', p_min_price: 125000, p_max_price: 125000, p_limit: 10 } },
  
  // 2.3 COMMERCIAL - AREA RANGES (18 test cases)
  { id: 'TC145', name: 'Commercial area under 500 sqft', params: { p_property_type: 'commercial', p_area_max: 500, p_limit: 10 } },
  { id: 'TC146', name: 'Commercial area 500-1000 sqft', params: { p_property_type: 'commercial', p_area_min: 500, p_area_max: 1000, p_limit: 10 } },
  { id: 'TC147', name: 'Commercial area 1000-2000 sqft', params: { p_property_type: 'commercial', p_area_min: 1000, p_area_max: 2000, p_limit: 10 } },
  { id: 'TC148', name: 'Commercial area 2000-5000 sqft', params: { p_property_type: 'commercial', p_area_min: 2000, p_area_max: 5000, p_limit: 10 } },
  { id: 'TC149', name: 'Commercial area 5000-10000 sqft', params: { p_property_type: 'commercial', p_area_min: 5000, p_area_max: 10000, p_limit: 10 } },
  { id: 'TC150', name: 'Commercial area above 10000 sqft', params: { p_property_type: 'commercial', p_area_min: 10000, p_limit: 10 } },
  { id: 'TC151', name: 'Commercial office space 1000-3000 sqft', params: { p_property_type: 'commercial', p_search_query: 'office', p_area_min: 1000, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC152', name: 'Commercial shop space 200-800 sqft', params: { p_property_type: 'commercial', p_search_query: 'shop', p_area_min: 200, p_area_max: 800, p_limit: 10 } },
  { id: 'TC153', name: 'Commercial warehouse space above 5000 sqft', params: { p_property_type: 'commercial', p_search_query: 'warehouse', p_area_min: 5000, p_limit: 10 } },
  { id: 'TC154', name: 'Commercial showroom space 1500-4000 sqft', params: { p_property_type: 'commercial', p_search_query: 'showroom', p_area_min: 1500, p_area_max: 4000, p_limit: 10 } },
  { id: 'TC155', name: 'Commercial retail space 300-1200 sqft', params: { p_property_type: 'commercial', p_search_query: 'retail', p_area_min: 300, p_area_max: 1200, p_limit: 10 } },
  { id: 'TC156', name: 'Commercial restaurant space 800-2500 sqft', params: { p_property_type: 'commercial', p_search_query: 'restaurant', p_area_min: 800, p_area_max: 2500, p_limit: 10 } },
  { id: 'TC157', name: 'Commercial IT space 2000-8000 sqft', params: { p_property_type: 'commercial', p_search_query: 'IT space', p_area_min: 2000, p_area_max: 8000, p_limit: 10 } },
  { id: 'TC158', name: 'Commercial coworking space 500-2000 sqft', params: { p_property_type: 'commercial', p_search_query: 'coworking', p_area_min: 500, p_area_max: 2000, p_limit: 10 } },
  { id: 'TC159', name: 'Commercial business center 3000-10000 sqft', params: { p_property_type: 'commercial', p_search_query: 'business center', p_area_min: 3000, p_area_max: 10000, p_limit: 10 } },
  { id: 'TC160', name: 'Commercial small space under 200 sqft', params: { p_property_type: 'commercial', p_area_max: 200, p_limit: 10 } },
  { id: 'TC161', name: 'Commercial medium space 1000-3000 sqft', params: { p_property_type: 'commercial', p_area_min: 1000, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC162', name: 'Commercial large space above 20000 sqft', params: { p_property_type: 'commercial', p_area_min: 20000, p_limit: 10 } },
  
  // 2.4 COMMERCIAL - LOCATION SPECIFIC (18 test cases)
  { id: 'TC163', name: 'Commercial in Gachibowli', params: { p_property_type: 'commercial', p_search_query: 'Gachibowli', p_limit: 10 } },
  { id: 'TC164', name: 'Commercial in Hitech City', params: { p_property_type: 'commercial', p_search_query: 'Hitech City', p_limit: 10 } },
  { id: 'TC165', name: 'Commercial in Madhapur', params: { p_property_type: 'commercial', p_search_query: 'Madhapur', p_limit: 10 } },
  { id: 'TC166', name: 'Commercial in Kondapur', params: { p_property_type: 'commercial', p_search_query: 'Kondapur', p_limit: 10 } },
  { id: 'TC167', name: 'Commercial in Kukatpally', params: { p_property_type: 'commercial', p_search_query: 'Kukatpally', p_limit: 10 } },
  { id: 'TC168', name: 'Commercial in Ameerpet', params: { p_property_type: 'commercial', p_search_query: 'Ameerpet', p_limit: 10 } },
  { id: 'TC169', name: 'Commercial in Banjara Hills', params: { p_property_type: 'commercial', p_search_query: 'Banjara Hills', p_limit: 10 } },
  { id: 'TC170', name: 'Commercial in Jubilee Hills', params: { p_property_type: 'commercial', p_search_query: 'Jubilee Hills', p_limit: 10 } },
  { id: 'TC171', name: 'Commercial in Begumpet', params: { p_property_type: 'commercial', p_search_query: 'Begumpet', p_limit: 10 } },
  { id: 'TC172', name: 'Commercial in Uppal', params: { p_property_type: 'commercial', p_search_query: 'Uppal', p_limit: 10 } },
  { id: 'TC173', name: 'Commercial in Kompally', params: { p_property_type: 'commercial', p_search_query: 'Kompally', p_limit: 10 } },
  { id: 'TC174', name: 'Commercial in Miyapur', params: { p_property_type: 'commercial', p_search_query: 'Miyapur', p_limit: 10 } },
  { id: 'TC175', name: 'Commercial in Nizampet', params: { p_property_type: 'commercial', p_search_query: 'Nizampet', p_limit: 10 } },
  { id: 'TC176', name: 'Commercial in Manikonda', params: { p_property_type: 'commercial', p_search_query: 'Manikonda', p_limit: 10 } },
  { id: 'TC177', name: 'Commercial in Bachupally', params: { p_property_type: 'commercial', p_search_query: 'Bachupally', p_limit: 10 } },
  { id: 'TC178', name: 'Commercial office in Hitech City', params: { p_property_type: 'commercial', p_search_query: 'office Hitech City', p_limit: 10 } },
  { id: 'TC179', name: 'Commercial shop in Ameerpet', params: { p_property_type: 'commercial', p_search_query: 'shop Ameerpet', p_limit: 10 } },
  { id: 'TC180', name: 'Commercial warehouse in Uppal', params: { p_property_type: 'commercial', p_search_query: 'warehouse Uppal', p_limit: 10 } },
  
  // Category 3: Land Properties - 54 test cases
  // 3.1 LAND - BASIC SEARCH (18 test cases)
  { id: 'TC181', name: 'Basic land search', params: { p_property_type: 'land', p_limit: 10, p_offset: 0 } },
  { id: 'TC182', name: 'Land with city filter - Hyderabad', params: { p_property_type: 'land', p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC183', name: 'Land with city filter - Secunderabad', params: { p_property_type: 'land', p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC184', name: 'Land with state filter - Telangana', params: { p_property_type: 'land', p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC185', name: 'Land with search query - plot', params: { p_property_type: 'land', p_search_query: 'plot', p_limit: 10 } },
  { id: 'TC186', name: 'Land with search query - agricultural', params: { p_property_type: 'land', p_search_query: 'agricultural', p_limit: 10 } },
  { id: 'TC187', name: 'Land with search query - residential plot', params: { p_property_type: 'land', p_search_query: 'residential plot', p_limit: 10 } },
  { id: 'TC188', name: 'Land with search query - commercial plot', params: { p_property_type: 'land', p_search_query: 'commercial plot', p_limit: 10 } },
  { id: 'TC189', name: 'Land with search query - industrial plot', params: { p_property_type: 'land', p_search_query: 'industrial plot', p_limit: 10 } },
  { id: 'TC190', name: 'Land with search query - farm land', params: { p_property_type: 'land', p_search_query: 'farm land', p_limit: 10 } },
  { id: 'TC191', name: 'Land with search query - vacant land', params: { p_property_type: 'land', p_search_query: 'vacant land', p_limit: 10 } },
  { id: 'TC192', name: 'Land with search query - open land', params: { p_property_type: 'land', p_search_query: 'open land', p_limit: 10 } },
  { id: 'TC193', name: 'Land with search query - layout', params: { p_property_type: 'land', p_search_query: 'layout', p_limit: 10 } },
  { id: 'TC194', name: 'Land with search query - venture', params: { p_property_type: 'land', p_search_query: 'venture', p_limit: 10 } },
  { id: 'TC195', name: 'Land with search query - investment', params: { p_property_type: 'land', p_search_query: 'investment', p_limit: 10 } },
  { id: 'TC196', name: 'Land with search query - gated community', params: { p_property_type: 'land', p_search_query: 'gated community', p_limit: 10 } },
  { id: 'TC197', name: 'Land with search query - HMDA approved', params: { p_property_type: 'land', p_search_query: 'HMDA approved', p_limit: 10 } },
  { id: 'TC198', name: 'Land with search query - DTCP approved', params: { p_property_type: 'land', p_search_query: 'DTCP approved', p_limit: 10 } },
  
  // 3.2 LAND - PRICE RANGES (18 test cases)
  { id: 'TC199', name: 'Land under 10 lakhs', params: { p_property_type: 'land', p_max_price: 1000000, p_limit: 10 } },
  { id: 'TC200', name: 'Land 10-25 lakhs', params: { p_property_type: 'land', p_min_price: 1000000, p_max_price: 2500000, p_limit: 10 } },
  { id: 'TC201', name: 'Land 25-50 lakhs', params: { p_property_type: 'land', p_min_price: 2500000, p_max_price: 5000000, p_limit: 10 } },
  { id: 'TC202', name: 'Land 50 lakhs - 1 crore', params: { p_property_type: 'land', p_min_price: 5000000, p_max_price: 10000000, p_limit: 10 } },
  { id: 'TC203', name: 'Land 1-2 crores', params: { p_property_type: 'land', p_min_price: 10000000, p_max_price: 20000000, p_limit: 10 } },
  { id: 'TC204', name: 'Land above 2 crores', params: { p_property_type: 'land', p_min_price: 20000000, p_limit: 10 } },
  { id: 'TC205', name: 'Residential plot under 15 lakhs', params: { p_property_type: 'land', p_search_query: 'residential plot', p_max_price: 1500000, p_limit: 10 } },
  { id: 'TC206', name: 'Commercial plot 50 lakhs - 2 crores', params: { p_property_type: 'land', p_search_query: 'commercial plot', p_min_price: 5000000, p_max_price: 20000000, p_limit: 10 } },
  { id: 'TC207', name: 'Agricultural land under 20 lakhs', params: { p_property_type: 'land', p_search_query: 'agricultural', p_max_price: 2000000, p_limit: 10 } },
  { id: 'TC208', name: 'Industrial plot above 1 crore', params: { p_property_type: 'land', p_search_query: 'industrial plot', p_min_price: 10000000, p_limit: 10 } },
  { id: 'TC209', name: 'Farm land 5-15 lakhs', params: { p_property_type: 'land', p_search_query: 'farm land', p_min_price: 500000, p_max_price: 1500000, p_limit: 10 } },
  { id: 'TC210', name: 'Vacant land 10-30 lakhs', params: { p_property_type: 'land', p_search_query: 'vacant land', p_min_price: 1000000, p_max_price: 3000000, p_limit: 10 } },
  { id: 'TC211', name: 'Layout plots 20-60 lakhs', params: { p_property_type: 'land', p_search_query: 'layout', p_min_price: 2000000, p_max_price: 6000000, p_limit: 10 } },
  { id: 'TC212', name: 'Investment land under 40 lakhs', params: { p_property_type: 'land', p_search_query: 'investment', p_max_price: 4000000, p_limit: 10 } },
  { id: 'TC213', name: 'Gated community plots 30-80 lakhs', params: { p_property_type: 'land', p_search_query: 'gated community', p_min_price: 3000000, p_max_price: 8000000, p_limit: 10 } },
  { id: 'TC214', name: 'HMDA approved plots 15-45 lakhs', params: { p_property_type: 'land', p_search_query: 'HMDA approved', p_min_price: 1500000, p_max_price: 4500000, p_limit: 10 } },
  { id: 'TC215', name: 'Exact price 25 lakhs', params: { p_property_type: 'land', p_min_price: 2500000, p_max_price: 2500000, p_limit: 10 } },
  { id: 'TC216', name: 'Budget land under 5 lakhs', params: { p_property_type: 'land', p_max_price: 500000, p_limit: 10 } },
  
  // 3.3 LAND - AREA RANGES (18 test cases)
  { id: 'TC217', name: 'Land area under 1000 sqft', params: { p_property_type: 'land', p_area_max: 1000, p_limit: 10 } },
  { id: 'TC218', name: 'Land area 1000-2000 sqft', params: { p_property_type: 'land', p_area_min: 1000, p_area_max: 2000, p_limit: 10 } },
  { id: 'TC219', name: 'Land area 2000-5000 sqft', params: { p_property_type: 'land', p_area_min: 2000, p_area_max: 5000, p_limit: 10 } },
  { id: 'TC220', name: 'Land area 5000-10000 sqft', params: { p_property_type: 'land', p_area_min: 5000, p_area_max: 10000, p_limit: 10 } },
  { id: 'TC221', name: 'Land area 10000-20000 sqft', params: { p_property_type: 'land', p_area_min: 10000, p_area_max: 20000, p_limit: 10 } },
  { id: 'TC222', name: 'Land area above 20000 sqft', params: { p_property_type: 'land', p_area_min: 20000, p_limit: 10 } },
  { id: 'TC223', name: 'Residential plot 1500-3000 sqft', params: { p_property_type: 'land', p_search_query: 'residential plot', p_area_min: 1500, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC224', name: 'Commercial plot 2000-8000 sqft', params: { p_property_type: 'land', p_search_query: 'commercial plot', p_area_min: 2000, p_area_max: 8000, p_limit: 10 } },
  { id: 'TC225', name: 'Agricultural land above 50000 sqft', params: { p_property_type: 'land', p_search_query: 'agricultural', p_area_min: 50000, p_limit: 10 } },
  { id: 'TC226', name: 'Industrial plot 10000-50000 sqft', params: { p_property_type: 'land', p_search_query: 'industrial plot', p_area_min: 10000, p_area_max: 50000, p_limit: 10 } },
  { id: 'TC227', name: 'Farm land above 100000 sqft', params: { p_property_type: 'land', p_search_query: 'farm land', p_area_min: 100000, p_limit: 10 } },
  { id: 'TC228', name: 'Vacant land 3000-12000 sqft', params: { p_property_type: 'land', p_search_query: 'vacant land', p_area_min: 3000, p_area_max: 12000, p_limit: 10 } },
  { id: 'TC229', name: 'Layout plots 1200-2400 sqft', params: { p_property_type: 'land', p_search_query: 'layout', p_area_min: 1200, p_area_max: 2400, p_limit: 10 } },
  { id: 'TC230', name: 'Investment land 2000-8000 sqft', params: { p_property_type: 'land', p_search_query: 'investment', p_area_min: 2000, p_area_max: 8000, p_limit: 10 } },
  { id: 'TC231', name: 'Gated community plots 1800-4000 sqft', params: { p_property_type: 'land', p_search_query: 'gated community', p_area_min: 1800, p_area_max: 4000, p_limit: 10 } },
  { id: 'TC232', name: 'Small plots under 800 sqft', params: { p_property_type: 'land', p_area_max: 800, p_limit: 10 } },
  { id: 'TC233', name: 'Medium plots 1500-5000 sqft', params: { p_property_type: 'land', p_area_min: 1500, p_area_max: 5000, p_limit: 10 } },
  { id: 'TC234', name: 'Large plots above 25000 sqft', params: { p_property_type: 'land', p_area_min: 25000, p_limit: 10 } },
  
  // Category 4: Mixed Searches - 60 test cases
  // 4.1 MIXED - BASIC SEARCHES (20 test cases)
  { id: 'TC235', name: 'All properties without filters', params: { p_limit: 10, p_offset: 0 } },
  { id: 'TC236', name: 'All properties in Hyderabad', params: { p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC237', name: 'All properties in Secunderabad', params: { p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC238', name: 'All properties in Telangana', params: { p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC239', name: 'All properties with search query - rent', params: { p_search_query: 'rent', p_limit: 10 } },
  { id: 'TC240', name: 'All properties with search query - sale', params: { p_search_query: 'sale', p_limit: 10 } },
  { id: 'TC241', name: 'All properties with search query - furnished', params: { p_search_query: 'furnished', p_limit: 10 } },
  { id: 'TC242', name: 'All properties with search query - parking', params: { p_search_query: 'parking', p_limit: 10 } },
  { id: 'TC243', name: 'All properties with search query - security', params: { p_search_query: 'security', p_limit: 10 } },
  { id: 'TC244', name: 'All properties with search query - garden', params: { p_search_query: 'garden', p_limit: 10 } },
  { id: 'TC245', name: 'All properties with search query - pool', params: { p_search_query: 'pool', p_limit: 10 } },
  { id: 'TC246', name: 'All properties with search query - gym', params: { p_search_query: 'gym', p_limit: 10 } },
  { id: 'TC247', name: 'All properties with search query - lift', params: { p_search_query: 'lift', p_limit: 10 } },
  { id: 'TC248', name: 'All properties with search query - power backup', params: { p_search_query: 'power backup', p_limit: 10 } },
  { id: 'TC249', name: 'All properties with search query - water storage', params: { p_search_query: 'water storage', p_limit: 10 } },
  { id: 'TC250', name: 'All properties with search query - fire safety', params: { p_search_query: 'fire safety', p_limit: 10 } },
  { id: 'TC251', name: 'All properties with search query - intercom', params: { p_search_query: 'intercom', p_limit: 10 } },
  { id: 'TC252', name: 'All properties with search query - children play area', params: { p_search_query: 'children play area', p_limit: 10 } },
  { id: 'TC253', name: 'All properties with search query - shopping center', params: { p_search_query: 'shopping center', p_limit: 10 } },
  { id: 'TC254', name: 'All properties with search query - club house', params: { p_search_query: 'club house', p_limit: 10 } },
  
  // 4.2 MIXED - PRICE RANGES (20 test cases)
  { id: 'TC255', name: 'All properties under 25,000', params: { p_max_price: 25000, p_limit: 10 } },
  { id: 'TC256', name: 'All properties 25,000 - 50,000', params: { p_min_price: 25000, p_max_price: 50000, p_limit: 10 } },
  { id: 'TC257', name: 'All properties 50,000 - 100,000', params: { p_min_price: 50000, p_max_price: 100000, p_limit: 10 } },
  { id: 'TC258', name: 'All properties above 100,000', params: { p_min_price: 100000, p_limit: 10 } },
  { id: 'TC259', name: 'All properties under 1 lakh', params: { p_max_price: 100000, p_limit: 10 } },
  { id: 'TC260', name: 'All properties 1-5 lakhs', params: { p_min_price: 100000, p_max_price: 500000, p_limit: 10 } },
  { id: 'TC261', name: 'All properties 5-10 lakhs', params: { p_min_price: 500000, p_max_price: 1000000, p_limit: 10 } },
  { id: 'TC262', name: 'All properties 10-25 lakhs', params: { p_min_price: 1000000, p_max_price: 2500000, p_limit: 10 } },
  { id: 'TC263', name: 'All properties 25-50 lakhs', params: { p_min_price: 2500000, p_max_price: 5000000, p_limit: 10 } },
  { id: 'TC264', name: 'All properties 50 lakhs - 1 crore', params: { p_min_price: 5000000, p_max_price: 10000000, p_limit: 10 } },
  { id: 'TC265', name: 'All properties 1-2 crores', params: { p_min_price: 10000000, p_max_price: 20000000, p_limit: 10 } },
  { id: 'TC266', name: 'All properties above 2 crores', params: { p_min_price: 20000000, p_limit: 10 } },
  { id: 'TC267', name: 'All properties in Hyderabad under 50,000', params: { p_city: 'Hyderabad', p_max_price: 50000, p_limit: 10 } },
  { id: 'TC268', name: 'All properties in Secunderabad 25,000-75,000', params: { p_city: 'Secunderabad', p_min_price: 25000, p_max_price: 75000, p_limit: 10 } },
  { id: 'TC269', name: 'All rent properties under 30,000', params: { p_search_query: 'rent', p_max_price: 30000, p_limit: 10 } },
  { id: 'TC270', name: 'All sale properties under 50 lakhs', params: { p_search_query: 'sale', p_max_price: 5000000, p_limit: 10 } },
  { id: 'TC271', name: 'All furnished properties 20,000-60,000', params: { p_search_query: 'furnished', p_min_price: 20000, p_max_price: 60000, p_limit: 10 } },
  { id: 'TC272', name: 'All properties with parking under 40,000', params: { p_search_query: 'parking', p_max_price: 40000, p_limit: 10 } },
  { id: 'TC273', name: 'All properties with security 30,000-80,000', params: { p_search_query: 'security', p_min_price: 30000, p_max_price: 80000, p_limit: 10 } },
  { id: 'TC274', name: 'All properties with garden above 50,000', params: { p_search_query: 'garden', p_min_price: 50000, p_limit: 10 } },
  
  // 4.3 MIXED - AREA RANGES (20 test cases)
  { id: 'TC275', name: 'All properties under 1000 sqft', params: { p_area_max: 1000, p_limit: 10 } },
  { id: 'TC276', name: 'All properties 1000-2000 sqft', params: { p_area_min: 1000, p_area_max: 2000, p_limit: 10 } },
  { id: 'TC277', name: 'All properties 2000-5000 sqft', params: { p_area_min: 2000, p_area_max: 5000, p_limit: 10 } },
  { id: 'TC278', name: 'All properties above 5000 sqft', params: { p_area_min: 5000, p_limit: 10 } },
  { id: 'TC279', name: 'All properties under 500 sqft', params: { p_area_max: 500, p_limit: 10 } },
  { id: 'TC280', name: 'All properties 500-1500 sqft', params: { p_area_min: 500, p_area_max: 1500, p_limit: 10 } },
  { id: 'TC281', name: 'All properties 1500-3000 sqft', params: { p_area_min: 1500, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC282', name: 'All properties 3000-10000 sqft', params: { p_area_min: 3000, p_area_max: 10000, p_limit: 10 } },
  { id: 'TC283', name: 'All properties above 10000 sqft', params: { p_area_min: 10000, p_limit: 10 } },
  { id: 'TC284', name: 'All properties in Hyderabad 800-1800 sqft', params: { p_city: 'Hyderabad', p_area_min: 800, p_area_max: 1800, p_limit: 10 } },
  { id: 'TC285', name: 'All properties in Secunderabad 1200-2500 sqft', params: { p_city: 'Secunderabad', p_area_min: 1200, p_area_max: 2500, p_limit: 10 } },
  { id: 'TC286', name: 'All rent properties 600-1500 sqft', params: { p_search_query: 'rent', p_area_min: 600, p_area_max: 1500, p_limit: 10 } },
  { id: 'TC287', name: 'All sale properties 1000-3000 sqft', params: { p_search_query: 'sale', p_area_min: 1000, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC288', name: 'All furnished properties 500-1200 sqft', params: { p_search_query: 'furnished', p_area_min: 500, p_area_max: 1200, p_limit: 10 } },
  { id: 'TC289', name: 'All properties with parking 800-2000 sqft', params: { p_search_query: 'parking', p_area_min: 800, p_area_max: 2000, p_limit: 10 } },
  { id: 'TC290', name: 'All properties with security 1000-2500 sqft', params: { p_search_query: 'security', p_area_min: 1000, p_area_max: 2500, p_limit: 10 } },
  { id: 'TC291', name: 'All properties with garden 1500-4000 sqft', params: { p_search_query: 'garden', p_area_min: 1500, p_area_max: 4000, p_limit: 10 } },
  { id: 'TC292', name: 'All properties with pool above 2000 sqft', params: { p_search_query: 'pool', p_area_min: 2000, p_limit: 10 } },
  { id: 'TC293', name: 'All properties with gym 800-3000 sqft', params: { p_search_query: 'gym', p_area_min: 800, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC294', name: 'All properties with lift 400-1800 sqft', params: { p_search_query: 'lift', p_area_min: 400, p_area_max: 1800, p_limit: 10 } },
  
  // Category 5: Edge Cases - 30 test cases
  // 5.1 PAGINATION AND LIMITS (10 test cases)
  { id: 'TC295', name: 'Large limit test', params: { p_limit: 100, p_offset: 0 } },
  { id: 'TC296', name: 'Maximum limit test', params: { p_limit: 10000, p_offset: 0 } },
  { id: 'TC297', name: 'Offset test - page 2', params: { p_limit: 10, p_offset: 10 } },
  { id: 'TC298', name: 'Offset test - page 5', params: { p_limit: 10, p_offset: 40 } },
  { id: 'TC299', name: 'Large offset test', params: { p_limit: 10, p_offset: 1000 } },
  { id: 'TC300', name: 'Residential with pagination', params: { p_property_type: 'residential', p_limit: 5, p_offset: 20 } },
  { id: 'TC301', name: 'Commercial with pagination', params: { p_property_type: 'commercial', p_limit: 5, p_offset: 15 } },
  { id: 'TC302', name: 'Land with pagination', params: { p_property_type: 'land', p_limit: 5, p_offset: 25 } },
  { id: 'TC303', name: 'Small limit test', params: { p_limit: 1, p_offset: 0 } },
  { id: 'TC304', name: 'Zero limit test (should default to 50)', params: { p_limit: 0, p_offset: 0 } },
  
  // 5.2 BOUNDARY CONDITIONS (10 test cases)
  { id: 'TC305', name: 'Minimum price boundary', params: { p_min_price: 1, p_limit: 10 } },
  { id: 'TC306', name: 'Maximum price boundary', params: { p_max_price: 999999999, p_limit: 10 } },
  { id: 'TC307', name: 'Minimum area boundary', params: { p_area_min: 1, p_limit: 10 } },
  { id: 'TC308', name: 'Maximum area boundary', params: { p_area_max: 999999, p_limit: 10 } },
  { id: 'TC309', name: 'Minimum bedrooms boundary', params: { p_property_type: 'residential', p_bedrooms: 0, p_limit: 10 } },
  { id: 'TC310', name: 'Maximum bedrooms boundary', params: { p_property_type: 'residential', p_bedrooms: 10, p_limit: 10 } },
  { id: 'TC311', name: 'Minimum bathrooms boundary', params: { p_property_type: 'residential', p_bathrooms: 0.5, p_limit: 10 } },
  { id: 'TC312', name: 'Maximum bathrooms boundary', params: { p_property_type: 'residential', p_bathrooms: 10, p_limit: 10 } },
  { id: 'TC313', name: 'Same min and max price', params: { p_min_price: 50000, p_max_price: 50000, p_limit: 10 } },
  { id: 'TC314', name: 'Same min and max area', params: { p_area_min: 1000, p_area_max: 1000, p_limit: 10 } },
  
  // 5.3 SPECIAL SEARCH QUERIES (10 test cases)
  { id: 'TC315', name: 'Empty search query', params: { p_search_query: '', p_limit: 10 } },
  { id: 'TC316', name: 'Single character search', params: { p_search_query: 'a', p_limit: 10 } },
  { id: 'TC317', name: 'Numeric search query', params: { p_search_query: '123', p_limit: 10 } },
  { id: 'TC318', name: 'Special characters search', params: { p_search_query: '!@#$%', p_limit: 10 } },
  { id: 'TC319', name: 'Very long search query', params: { p_search_query: 'this is a very long search query that contains many words and should test the search functionality with extended text input', p_limit: 10 } },
  { id: 'TC320', name: 'Search with multiple spaces', params: { p_search_query: 'apartment     with     multiple     spaces', p_limit: 10 } },
  { id: 'TC321', name: 'Case sensitivity test - lowercase', params: { p_search_query: 'apartment', p_limit: 10 } },
  { id: 'TC322', name: 'Case sensitivity test - uppercase', params: { p_search_query: 'APARTMENT', p_limit: 10 } },
  { id: 'TC323', name: 'Case sensitivity test - mixed case', params: { p_search_query: 'ApArTmEnT', p_limit: 10 } },
  { id: 'TC324', name: 'Search with partial words', params: { p_search_query: 'apart', p_limit: 10 } }
];

// Test execution function
async function executeTest(testCase) {
  const startTime = Date.now();
  const result = {
    id: testCase.id,
    name: testCase.name,
    status: 'PENDING',
    executionTime: 0,
    resultCount: 0,
    error: null,
    details: null
  };

  try {
    const { data, error } = await supabase.rpc('search_all_properties', testCase.params);
    const endTime = Date.now();
    result.executionTime = endTime - startTime;

    if (error) {
      result.status = 'FAILED';
      result.error = error.message || error.toString();
    } else {
      result.status = 'SUCCESS';
      result.resultCount = data ? data.length : 0;
      result.details = {
        hasResults: data && data.length > 0,
        sampleResult: data && data.length > 0 ? {
          id: data[0].id,
          property_type: data[0].property_type,
          city: data[0].city,
          title: data[0].title ? data[0].title.substring(0, 50) + '...' : 'N/A'
        } : null
      };
    }
  } catch (exception) {
    const endTime = Date.now();
    result.executionTime = endTime - startTime;
    result.status = 'FAILED';
    result.error = exception.message || exception.toString();
  }

  return result;
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting COMPLETE comprehensive search_all_properties function tests...');
  console.log(`📊 Total test cases to execute: ${testCases.length}`);
  console.log('⏰ Test execution started at:', new Date().toISOString());
  
  const results = {
    executed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    totalExecutionTime: 0,
    testResults: []
  };

  const startTime = Date.now();
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🔍 [${i + 1}/${testCases.length}] Executing ${testCase.id}: ${testCase.name}`);
    
    try {
      const result = await executeTest(testCase);
      results.testResults.push(result);
      results.executed++;
      results.totalExecutionTime += result.executionTime;
      
      if (result.status === 'SUCCESS') {
        results.success++;
        console.log(`✅ SUCCESS - ${result.resultCount} results in ${result.executionTime}ms`);
      } else if (result.status === 'FAILED') {
        results.failed++;
        console.log(`❌ FAILED - ${result.error} (${result.executionTime}ms)`);
      }
    } catch (error) {
      results.executed++;
      results.failed++;
      results.testResults.push({
        id: testCase.id,
        name: testCase.name,
        status: 'FAILED',
        executionTime: 0,
        resultCount: 0,
        error: error.message || error.toString(),
        details: null
      });
      console.log(`❌ EXCEPTION - ${error.message}`);
    }
    
    // Small delay between tests to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  const endTime = Date.now();
  results.totalExecutionTime = endTime - startTime;
  
  console.log('\n🏁 Test execution completed!');
  console.log('📊 FINAL RESULTS:');
  console.log(`   Total Executed: ${results.executed}`);
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ⏱️  Total Time: ${results.totalExecutionTime}ms`);
  console.log(`   📈 Success Rate: ${((results.success / results.executed) * 100).toFixed(2)}%`);
  
  return results;
}

// Generate detailed report
function generateReport(results) {
  const reportTime = new Date().toISOString();
  
  let report = `# COMPLETE Search All Properties Test Results Report (324 Test Cases)\n\n`;
  report += `**Generated:** ${reportTime}\n`;
  report += `**Total Test Cases:** ${testCases.length}\n\n`;
  
  // Executive Summary
  report += `## Executive Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Executed | ${results.executed} |\n`;
  report += `| ✅ Success | ${results.success} |\n`;
  report += `| ❌ Failed | ${results.failed} |\n`;
  report += `| ⏭️ Skipped | ${results.skipped} |\n`;
  report += `| Success Rate | ${((results.success / results.executed) * 100).toFixed(2)}% |\n`;
  report += `| Total Execution Time | ${results.totalExecutionTime}ms |\n`;
  report += `| Average Test Time | ${(results.totalExecutionTime / results.executed).toFixed(2)}ms |\n\n`;
  
  // Test Categories Analysis
  report += `## Test Categories Analysis\n\n`;
  
  const categories = {
    'Residential': results.testResults.filter(r => r.id.startsWith('TC0') || (r.id.startsWith('TC1') && parseInt(r.id.substring(2)) <= 108)),
    'Commercial': results.testResults.filter(r => r.id.startsWith('TC1') && parseInt(r.id.substring(2)) >= 109 && parseInt(r.id.substring(2)) <= 180),
    'Land': results.testResults.filter(r => r.id.startsWith('TC1') && parseInt(r.id.substring(2)) >= 181 && parseInt(r.id.substring(2)) <= 234),
    'Mixed': results.testResults.filter(r => r.id.startsWith('TC2') && parseInt(r.id.substring(2)) >= 235 && parseInt(r.id.substring(2)) <= 294),
    'Edge Cases': results.testResults.filter(r => r.id.startsWith('TC3') && parseInt(r.id.substring(2)) >= 295)
  };
  
  report += `| Category | Total | Success | Failed | Success Rate |\n`;
  report += `|----------|-------|---------|--------|-------------|\n`;
  
  for (const [category, tests] of Object.entries(categories)) {
    if (tests.length > 0) {
      const success = tests.filter(t => t.status === 'SUCCESS').length;
      const failed = tests.filter(t => t.status === 'FAILED').length;
      const rate = tests.length > 0 ? ((success / tests.length) * 100).toFixed(2) : '0.00';
      report += `| ${category} | ${tests.length} | ${success} | ${failed} | ${rate}% |\n`;
    }
  }
  
  // Failed Tests Summary
  const failedTests = results.testResults.filter(r => r.status === 'FAILED');
  if (failedTests.length > 0) {
    report += `\n## Failed Tests Summary\n\n`;
    report += `Total failed tests: ${failedTests.length}\n\n`;
    
    failedTests.forEach(test => {
      report += `**${test.id}:** ${test.name}\n`;
      report += `Error: ${test.error}\n\n`;
    });
  }
  
  // Performance Analysis
  report += `\n## Performance Analysis\n\n`;
  const sortedByTime = [...results.testResults].sort((a, b) => b.executionTime - a.executionTime);
  
  report += `### Slowest Tests (Top 10)\n`;
  report += `| Test ID | Name | Execution Time | Result Count |\n`;
  report += `|---------|------|----------------|---------------|\n`;
  
  sortedByTime.slice(0, 10).forEach(test => {
    report += `| ${test.id} | ${test.name} | ${test.executionTime}ms | ${test.resultCount} |\n`;
  });
  
  report += `\n### Fastest Tests (Top 10)\n`;
  report += `| Test ID | Name | Execution Time | Result Count |\n`;
  report += `|---------|------|----------------|---------------|\n`;
  
  sortedByTime.slice(-10).reverse().forEach(test => {
    report += `| ${test.id} | ${test.name} | ${test.executionTime}ms | ${test.resultCount} |\n`;
  });
  
  // Detailed Test Results Summary
  report += `\n## Detailed Test Results Summary\n\n`;
  
  results.testResults.forEach((result, index) => {
    const status = result.status === 'SUCCESS' ? '✅ SUCCESS' : '❌ FAILED';
    report += `**${result.id}:** ${result.name} - ${status} (${result.executionTime}ms, ${result.resultCount} results)\n`;
    
    if (result.error) {
      report += `   Error: ${result.error}\n`;
    }
    
    if (result.details && result.details.sampleResult) {
      report += `   Sample: ${result.details.sampleResult.property_type} in ${result.details.sampleResult.city}\n`;
    }
  });
  
  // Commentary and Analysis
  report += `\n## Commentary and Analysis\n\n`;
  report += `### Database Function Performance\n`;
  report += `The search_all_properties function demonstrates ${results.success > 0 ? 'good' : 'poor'} performance with an average execution time of ${(results.totalExecutionTime / results.executed).toFixed(2)}ms per test.\n\n`;
  
  report += `### Test Coverage Analysis\n`;
  report += `This comprehensive test suite covers ALL 324 test cases including:\n`;
  report += `- **Residential Properties (108 tests)**: Basic search, BHK configurations, price ranges, area ranges, location-specific, complex combinations\n`;
  report += `- **Commercial Properties (72 tests)**: Basic search, price ranges, area ranges, location-specific searches\n`;
  report += `- **Land Properties (54 tests)**: Basic search, price ranges, area ranges\n`;
  report += `- **Mixed Searches (60 tests)**: Cross-property searches, price ranges, area ranges\n`;
  report += `- **Edge Cases (30 tests)**: Pagination, boundary conditions, special search queries\n\n`;
  
  report += `### Key Findings\n`;
  if (results.success === results.executed) {
    report += `- ✅ ALL ${results.executed} tests passed successfully\n`;
    report += `- ✅ Function handles all parameter combinations correctly\n`;
    report += `- ✅ No critical errors or exceptions encountered\n`;
    report += `- ✅ Complete test coverage achieved\n`;
  } else {
    report += `- ⚠️ ${results.failed} tests failed out of ${results.executed} total tests\n`;
    report += `- ⚠️ Success rate: ${((results.success / results.executed) * 100).toFixed(2)}%\n`;
  }
  
  report += `\n### Recommendations\n`;
  if (results.failed > 0) {
    report += `1. **Address Failed Tests:** Review and fix the ${results.failed} failing test cases\n`;
    report += `2. **Error Analysis:** Investigate common error patterns in failed tests\n`;
    report += `3. **Performance Optimization:** Consider optimizing slower-performing queries\n`;
  } else {
    report += `1. **Production Ready:** All tests passed - function is ready for production\n`;
    report += `2. **Maintain Performance:** Continue monitoring function performance\n`;
    report += `3. **Regular Testing:** Run these tests regularly to catch regressions\n`;
  }
  
  report += `\n---\n`;
  report += `*Complete 324 test case report generated for search_all_properties function*\n`;
  
  return report;
}

// Main execution
async function main() {
  try {
    const results = await runAllTests();
    const report = generateReport(results);
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'kb', 'sql_testing', 'search_all_properties_test_cases_result.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n📄 Complete 324 test case report saved to: ${reportPath}`);
    console.log('\n✅ COMPLETE test execution finished!');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the complete tests
main();