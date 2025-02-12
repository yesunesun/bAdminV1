// src/lib/database.types.ts
// Version: 1.1.0
// Last Modified: 12-02-2025 17:15 IST

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
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          is_active: boolean;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          is_active?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          is_active?: boolean;
          is_super_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}