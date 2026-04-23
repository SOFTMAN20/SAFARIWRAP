import { createClient } from '../supabase/client';

const supabase = createClient();

interface SignUpData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  brandColor1?: string;
  brandColor2?: string;
  logoFile?: File | null;
  role?: 'operator' | 'admin';
}

export const authApi = {
  async signUp({
    email,
    password,
    name,
    businessName,
    brandColor1 = '#1B4D3E',
    brandColor2 = '#F4C542',
    logoFile,
    role = 'operator',
  }: SignUpData) {
    console.log('🚀 Starting signup process...', {
      email,
      name,
      businessName,
      brandColor1,
      brandColor2,
      hasLogo: !!logoFile,
    });

    // 1. Create auth user with metadata (operator record will be auto-created by trigger)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          business_name: businessName,
          brand_color_1: brandColor1,
          brand_color_2: brandColor2,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (authError) {
      console.error('❌ Auth signup error:', authError);
      throw authError;
    }
    if (!authData.user) throw new Error('User creation failed');

    console.log('✅ Auth user created:', authData.user.id);

    // Check if email confirmation is required
    if (!authData.session) {
      // Email confirmation required - operator record will be created by trigger
      console.log('📧 Email confirmation required');
      throw new Error('Please check your email to confirm your account before logging in.');
    }

    console.log('✅ Session created, proceeding with operator setup...');

    // Session exists - user can login immediately
    // Create profile and operator records
    
    // 2. Create profile record
    console.log('💾 Creating profile record...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: name,
        role: role,
      });

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      // Continue anyway - might already exist
    } else {
      console.log('✅ Profile created');
    }

    // 3. Create operator record
    console.log('💾 Creating operator record...');
    const { error: operatorCreateError } = await supabase
      .from('operators')
      .insert({
        id: authData.user.id,
        business_name: businessName,
        brand_color_1: brandColor1,
        brand_color_2: brandColor2,
      });

    if (operatorCreateError) {
      console.error('❌ Operator creation error:', operatorCreateError);
      throw new Error('Failed to create operator account. Please contact support.');
    }
    console.log('✅ Operator record created');

    let logoUrl: string | null = null;

    // 4. Upload logo if provided
    if (logoFile) {
      console.log('📤 Uploading logo...');
      const ext = logoFile.name.split('.').pop();
      const path = `logos/${authData.user.id}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('safariwrap-assets')
        .upload(path, logoFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('safariwrap-assets')
          .getPublicUrl(path);
        
        logoUrl = urlData.publicUrl;
        console.log('✅ Logo uploaded:', logoUrl);
      } else {
        console.error('❌ Logo upload error:', uploadError);
      }
    }

    // 5. Update operator record with logo if uploaded
    if (logoUrl) {
      console.log('💾 Updating operator with logo URL...');
      const { error: logoUpdateError } = await supabase
        .from('operators')
        .update({ logo_url: logoUrl })
        .eq('id', authData.user.id);

      if (logoUpdateError) {
        console.error('❌ Error updating operator logo:', logoUpdateError);
      } else {
        console.log('✅ Operator logo updated successfully');
      }
    }

    // Verify the operator record
    const { data: operatorData, error: fetchError } = await supabase
      .from('operators')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching operator data:', fetchError);
    } else {
      console.log('✅ Final operator data:', operatorData);
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  async getUserRole(): Promise<'operator' | 'admin' | 'guest'> {
    const { data, error } = await supabase.rpc('get_user_role');
    if (error) {
      console.error('Error getting user role:', error);
      return 'guest';
    }
    return data as 'operator' | 'admin' | 'guest';
  },

  async isAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return data as boolean;
  },
};
