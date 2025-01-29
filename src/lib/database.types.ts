export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          price: number;
          bedrooms: number | null;
          bathrooms: number | null;
          square_feet: number | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          created_at: string;
          updated_at: string;
          status: 'draft' | 'published';
          property_details: any;
          tags: string[];
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          price: number;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: 'draft' | 'published';
          property_details?: any;
          tags?: string[];
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          bedrooms?: number | null;
          bathrooms?: number | null;
          square_feet?: number | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: 'draft' | 'published';
          property_details?: any;
          tags?: string[];
        };
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          url?: string;
          created_at?: string;
        };
      };
    };
  };
}