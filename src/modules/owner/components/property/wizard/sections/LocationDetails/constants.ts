// src/modules/owner/components/property/wizard/sections/LocationDetails/constants.ts
// Version: 2.0.0
// Last Modified: 03-03-2025 23:15 IST
// Purpose: Local constants for LocationDetails component - Telangana focused

// Telangana districts
export const TELANGANA_DISTRICTS = [
  'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon',
  'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam',
  'Mahabubabad', 'Mahbubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri',
  'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal',
  'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy',
  'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Urban',
  'Warangal Rural', 'Yadadri Bhuvanagiri'
];

// Cities by district in Telangana
export const CITIES_BY_DISTRICT: Record<string, string[]> = {
  'Hyderabad': ['Hyderabad', 'Secunderabad'],
  'Medchal-Malkajgiri': ['Kompally', 'Alwal', 'Medchal', 'Malkajgiri', 'Bowenpally'],
  'Rangareddy': ['Gachibowli', 'Kondapur', 'Madhapur', 'Shamshabad', 'LB Nagar', 'Manikonda', 'Narsingi'],
  'Sangareddy': ['Patancheru', 'Sangareddy', 'Isnapur', 'Ameenpur'],
  'Karimnagar': ['Karimnagar', 'Huzurabad', 'Jammikunta'],
  'Warangal Urban': ['Warangal', 'Hanamkonda', 'Kazipet'],
  'Khammam': ['Khammam', 'Kothagudem']
  // Add more as needed
};

// Localities by city
export const LOCALITIES_BY_CITY: Record<string, string[]> = {
  'Hyderabad': [
    'Banjara Hills', 'Jubilee Hills', 'Ameerpet', 'Punjagutta', 'Mehdipatnam',
    'Himayatnagar', 'Begumpet', 'Somajiguda', 'Khairatabad', 'Lakdikapul',
    'Abids', 'Koti', 'Basheerbagh', 'Dilsukhnagar', 'Toli Chowki',
    'Kukatpally', 'KPHB', 'Miyapur'
  ],
  'Secunderabad': [
    'Paradise', 'Patny', 'Marredpally', 'Trimulgherry', 'Sainikpuri',
    'Bowenpally', 'Karkhana', 'Maredpally', 'Begumpet', 'Cantonment'
  ],
  'Gachibowli': [
    'Nanakramguda', 'Gopanpally', 'Financial District', 'Gowlidoddy', 'Tellapur',
    'DLF', 'Narsingi', 'Manikonda'
  ],
  'Kondapur': [
    'Kothaguda', 'Masjid Banda', 'Hafeezpet', 'Chandanagar', 'HITEC City',
    'Botanical Garden', 'Gachibowli Junction'
  ],
  'Madhapur': [
    'HITEC City', 'Ayyappa Society', 'Yousufguda', 'Jubilee Hills', 'Kavuri Hills',
    'Durgam Cheruvu', 'Cyber Towers'
  ],
  'Kompally': [
    'Kandlakoya', 'Suchitra', 'Jeedimetla', 'Gundlapochampally'
  ],
  'Alwal': [
    'Lothkunta', 'Yapral', 'Bolarum', 'Bagh Amberpet'
  ],
  // Add more cities and their localities as needed
};

// Keep the existing HYDERABAD_LOCATIONS for backward compatibility
export const HYDERABAD_LOCATIONS: Record<string, string[]> = {
  'West Zone': ['HITEC City', 'Madhapur', 'Gachibowli', 'Kondapur'],
  'Central Zone': ['Banjara Hills', 'Jubilee Hills', 'Ameerpet', 'Punjagutta'],
  'East Zone': ['Uppal', 'LB Nagar', 'Dilsukhnagar', 'Nacharam'],
  'North Zone': ['Kompally', 'Alwal', 'Secunderabad', 'Medchal'],
  'South Zone': ['Mehdipatnam', 'Attapur', 'Rajendranagar', 'Shamshabad']
};