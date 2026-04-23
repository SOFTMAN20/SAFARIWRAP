import { createClient } from '../supabase/client';
import { Operator } from '../types';

const supabase = createClient();

export const operatorsApi = {
  async getCurrentOperator() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data as Operator;
  },

  async updateOperator(operatorId: string, updates: Partial<Operator>) {
    const { data, error } = await supabase
      .from('operators')
      .update(updates)
      .eq('id', operatorId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Operator;
  },

  async uploadOperatorLogo(file: File) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `logos/${user.id}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('safariwrap-assets')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('safariwrap-assets')
      .getPublicUrl(fileName);

    // Update the operator's logo_url in the database
    const { error: updateError } = await supabase
      .from('operators')
      .update({ logo_url: publicUrl })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return publicUrl;
  },
};
