import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'puntor';
  password?: string;
}

// Store current user in sessionStorage
const STORAGE_KEY = 'rentcar_current_user';

export const authService = {
  // Sign in with email/username and password (from public.users table)
  async signIn(identifier: string, password: string) {
    const trimmedIdentifier = identifier.trim().toLowerCase();
    
    // Try to find user by email first, then by username
    let { data, error } = await (supabase
      .from('users') as any)
      .select('*')
      .eq('email', trimmedIdentifier)
      .eq('password', password)
      .single();

    // If not found by email, try username
    if (error || !data) {
      const { data: usernameData, error: usernameError } = await (supabase
        .from('users') as any)
        .select('*')
        .eq('username', trimmedIdentifier)
        .eq('password', password)
        .single();
      
      if (usernameError || !usernameData) {
        throw new Error('Email/Username ose fjalëkalim i gabuar. Ju lutem kontrolloni kredencialet tuaja.');
      }
      
      data = usernameData;
      error = null;
    }

    const user: User = {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
      password: data.password,
    };

    // Store user in sessionStorage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return { user, profile: user };
  },

  // Sign out
  async signOut() {
    sessionStorage.removeItem(STORAGE_KEY);
  },

  // Get current user from sessionStorage
  async getCurrentUser(): Promise<User | null> {
    const userStr = sessionStorage.getItem(STORAGE_KEY);
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      // Verify user still exists in database
      const { data } = await (supabase
        .from('users') as any)
        .select('*')
        .eq('id', user.id)
        .single();

      if (!data) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role,
        password: data.password,
      };
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  // Get user profile from public.users table
  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await (supabase
      .from('users') as any)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data ? {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
      password: data.password,
    } : null;
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await (supabase
      .from('users') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      password: user.password || undefined,
    }));
  },

  // Create user (admin only)
  // Creates user directly in public.users table
  async createUser(userData: {
    email: string;
    username: string;
    password: string;
    role: 'admin' | 'puntor';
  }): Promise<User> {
    const insertData: any = {
      email: userData.email.trim().toLowerCase(),
      username: userData.username.trim(),
      password: userData.password, // Store password in plain text
      role: userData.role,
    };
    
    const { data, error } = await (supabase
      .from('users') as any)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('email')) {
          throw new Error('Ky email ekziston tashmë.');
        } else if (error.message.includes('username')) {
          throw new Error('Ky username ekziston tashmë.');
        }
        throw new Error('Ky email ose username ekziston tashmë.');
      }
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
      password: data.password,
    };
  },

  // Update user (admin only)
  async updateUser(userId: string, updates: {
    username?: string;
    role?: 'admin' | 'puntor';
    password?: string;
  }): Promise<User> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.username !== undefined) updateData.username = updates.username.trim();
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.password) updateData.password = updates.password;

    const { data, error } = await (supabase
      .from('users') as any)
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // If current user updated themselves, update sessionStorage
    const currentUserStr = sessionStorage.getItem(STORAGE_KEY);
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role,
          password: data.password,
        }));
      }
    }

    return {
      id: data.id,
      email: data.email,
      username: data.username,
      role: data.role,
      password: data.password,
    };
  },

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    // Delete from public.users
    const { error } = await (supabase
      .from('users') as any)
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    // If deleted user was current user, sign them out
    const currentUserStr = sessionStorage.getItem(STORAGE_KEY);
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  },
};

