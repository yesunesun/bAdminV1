// src/modules/admin/services/userService.ts
// Version: 2.2.0
// Last Modified: 24-02-2025 12:45 IST

import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string | null;
  phone?: string | null;
  status?: string;
  has_profile?: boolean;
}

interface FetchUsersOptions {
  page: number;
  itemsPerPage: number;
  searchTerm?: string;
  roleFilter?: string;
  statusFilter?: string;
}

export class UserService {
  static async fetchUsers(options: FetchUsersOptions) {
    try {
      console.log("Fetching users with options:", options);

      // Call the database function
      const { data, error } = await supabase.rpc('get_all_auth_users');

      if (error) {
        console.error("Error calling get_all_auth_users:", error);
        return { users: [], total: 0, error: null };
      }

      console.log(`Retrieved ${data?.length || 0} users from database function`);

      if (!data || data.length === 0) {
        return { users: [], total: 0, error: null };
      }

      // Process the users
      const allUsers = data.map(user => {
        // Determine status
        let status = 'active';
        if (user.banned_until) status = 'inactive';
        else if (user.invited_at && !user.last_sign_in_at) status = 'invited';
        else if (!user.has_profile) status = 'pending';

        return {
          id: user.id,
          email: user.email,
          role: user.role || 'user',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          phone: user.phone,
          status: status,
          has_profile: user.has_profile
        };
      });

      // Apply filters
      let filteredUsers = allUsers;

      if (options.searchTerm?.trim()) {
        filteredUsers = filteredUsers.filter(user =>
          user.email?.toLowerCase().includes(options.searchTerm!.toLowerCase())
        );
      }

      if (options.roleFilter && options.roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user =>
          user.role === options.roleFilter
        );
      }

      if (options.statusFilter && options.statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user =>
          user.status === options.statusFilter
        );
      }

      // Apply pagination
      const start = (options.page - 1) * options.itemsPerPage;
      const end = start + options.itemsPerPage - 1;
      const paginatedUsers = filteredUsers.slice(start, Math.min(end + 1, filteredUsers.length));

      return {
        users: paginatedUsers,
        total: filteredUsers.length,
        error: null
      };
    } catch (error) {
      console.error("Unexpected error in fetchUsers:", error);
      return { users: [], total: 0, error: null };
    }
  }

  static async deleteUser(userId: string) {
    try {
      console.log('User Delete Operation', 'Starting', { userId });

      // Log the function call details
      console.log('Calling RPC function: delete_user_completely');
      console.log('With parameters:', { user_id: userId });

      // Call the database function
      const response = await supabase.rpc('delete_user_completely', {
        user_id: userId
      });

      // Log the raw response for debugging
      console.log('Raw Supabase Response:', JSON.stringify(response, null, 2));

      const { data, error } = response;

      // Detailed error logging
      if (error) {
        console.error('Supabase RPC Error Details:');
        console.error('- Code:', error.code);
        console.error('- Message:', error.message);
        console.error('- Details:', error.details);
        console.error('- Hint:', error.hint);
        return { error: `Database error (${error.code}): ${error.message}` };
      }

      // Log the data structure
      console.log('Response data type:', typeof data);
      console.log('Response data value:', data);
      
      if (data === null) {
        console.error('Function returned null data');
        return { error: 'Function returned no data' };
      }

      // Check if data has the expected structure
      if (typeof data === 'object') {
        console.log('Data has expected object structure');
        
        if ('success' in data) {
          console.log('Success property exists:', data.success);
          
          if (!data.success) {
            console.error('Function reported failure:', data.message);
            return { error: data.message || 'Function reported failure without details' };
          }
        } else {
          console.warn('Data object does not have success property');
        }
      }

      console.log('User successfully deleted:', userId);
      return { error: null };
    } catch (error) {
      // Detailed exception logging
      console.error('Exception in deleteUser:');
      if (error instanceof Error) {
        console.error('- Name:', error.name);
        console.error('- Message:', error.message);
        console.error('- Stack:', error.stack);
      } else {
        console.error('- Non-Error exception:', error);
      }
      
      return { 
        error: 'Failed to delete user: ' + 
          (error instanceof Error ? error.message : 'Unknown error') 
      };
    }
  }
}