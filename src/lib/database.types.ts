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
          status: 'draft' | 'pending_review' | 'rejected' | 'published';
          property_details: any;
          tags: string[];
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
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
          status?: 'draft' | 'pending_review' | 'rejected' | 'published';
          property_details?: any;
          tags?: string[];
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
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
          status?: 'draft' | 'pending_review' | 'rejected' | 'published';
          property_details?: any;
          tags?: string[];
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          created_at: string;
          is_approved: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          created_at?: string;
          is_approved?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          url?: string;
          created_at?: string;
          is_approved?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string;
          role: 'super_admin' | 'supervisor' | 'property_owner' | 'property_seeker';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone: string;
          role: 'super_admin' | 'supervisor' | 'property_owner' | 'property_seeker';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          phone?: string;
          role?: 'super_admin' | 'supervisor' | 'property_owner' | 'property_seeker';
          updated_at?: string;
        };
      };
    };
  };
}