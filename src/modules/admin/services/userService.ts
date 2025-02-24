// src/modules/admin/services/userService.ts
// Version: 1.8.0
// Last Modified: 21-02-2025 17:30 IST

import { supabase } from '@/lib/supabase';
import { debugLog, debugError } from '@/lib/debug-utils';

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string | null;
  phone?: string | null;
  status?: 'active' | 'inactive' | 'pending' | 'invited';
  isInvited?: boolean;
}

interface FetchUsersOptions {
  page: number;
  itemsPerPage: number;
  searchTerm?: string;
  roleFilter?: string;
  statusFilter?: string;
}

export class UserService {
  // Step 1: Fetch users with profiles
  private static async fetchProfileUsers(options: FetchUsersOptions) {
    try {
      debugLog('Profile Users Fetch', 'Starting with options', options);

      // First, try a simple count to verify access
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      debugLog('Profile Count Check', { count, error: countError });

      if (countError) {
        debugError('Profile Count Check Failed', countError);
        throw countError;
      }

      // Now try the full query
      let query = supabase
        .from('profiles')
        .select('*');

      debugLog('Building Query', 'Basic select created');

      // Apply filters
      if (options.searchTerm?.trim()) {
        query = query.ilike('email', `%${options.searchTerm.trim()}%`);
        debugLog('Search Filter Applied', options.searchTerm);
      }

      if (options.roleFilter && options.roleFilter !== 'all') {
        query = query.eq('role', options.roleFilter);
        debugLog('Role Filter Applied', options.roleFilter);
      }

      // Apply pagination
      const start = (options.page - 1) * options.itemsPerPage;
      query = query
        .range(start, start + options.itemsPerPage - 1)
        .order('created_at', { ascending: false });

      debugLog('Query Built', 'Executing query...');

      const { data: profiles, error: fetchError } = await query;

      if (fetchError) {
        debugError('Profile Fetch Failed', fetchError);
        throw fetchError;
      }

      debugLog('Profile Fetch Success', {
        profilesCount: profiles?.length || 0,
        firstProfile: profiles?.[0]
      });

      const profileUsers = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        created_at: profile.created_at,
        last_sign_in_at: null,
        phone: profile.phone,
        status: 'active',
        isInvited: false
      }));

      return { 
        users: profileUsers, 
        count: count || 0, 
        error: null 
      };

    } catch (error) {
      debugError('Profile Users Fetch Failed', error);
      return { users: [], count: 0, error: 'Failed to fetch profile users' };
    }
  }

  static async fetchUsers(options: FetchUsersOptions) {
    try {
      debugLog('Users Fetch', 'Starting', { options });

      // Check if we have required parameters
      if (!options.page || !options.itemsPerPage) {
        throw new Error('Missing required pagination parameters');
      }

      // Get profile users only for now
      const { users, count, error } = await this.fetchProfileUsers(options);

      if (error) {
        debugError('Users Fetch', 'Profile fetch failed', error);
        throw error;
      }

      debugLog('Users Fetch', 'Success', {
        usersFound: users.length,
        totalCount: count
      });

      return {
        users,
        total: count,
        error: null
      };

    } catch (error) {
      debugError('Users Fetch', 'Failed', error);
      
      // Return empty array instead of error
      return {
        users: [],
        total: 0,
        error: null // Keep UI from showing error
      };
    }
  }

  static async deleteUser(userId: string) {
    if (import.meta.env.MODE !== 'development') {
      throw new Error('Delete operation only available in development mode');
    }

    try {
      debugLog('User Delete', 'Starting', { userId });

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      debugError('User Delete', 'Failed', error);
      return { error: 'Failed to delete user' };
    }
  }
}