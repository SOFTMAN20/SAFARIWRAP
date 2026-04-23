import { createClient } from '../supabase/client';

const supabase = createClient();

/**
 * Admin Setup Utility
 * 
 * This utility helps create the first admin user for the platform.
 * After the first admin is created, they can promote other users to admin via the admin panel.
 */

export const adminSetup = {
  /**
   * Promote an existing operator to admin role
   * This should only be used for initial setup or by existing admins
   */
  async promoteToAdmin(operatorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('operators')
        .update({ role: 'admin' })
        .eq('id', operatorId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  /**
   * Check if any admin users exist in the system
   */
  async hasAdminUsers(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (error) {
        console.error('Error checking for admin users:', error);
        return false;
      }

      return (data?.length ?? 0) > 0;
    } catch (err) {
      console.error('Error checking for admin users:', err);
      return false;
    }
  },

  /**
   * Get all operators (for admin to promote)
   */
  async getAllOperators(): Promise<Array<{ id: string; name: string; email: string; role: string }>> {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('id, name, email, role')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching operators:', error);
        return [];
      }

      return data ?? [];
    } catch (err) {
      console.error('Error fetching operators:', err);
      return [];
    }
  },
};
