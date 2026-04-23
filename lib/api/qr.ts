import { createClient } from '../supabase/client';

const supabase = createClient();

export interface QRCode {
  id: string;
  event_id: string;
  short_code: string;
  code_url: string;
  scans_count: number;
  unique_scans_count: number;
  created_at: string;
}

export const qrApi = {
  /**
   * Get QR code for an event
   */
  async getQRCode(eventId: string): Promise<QRCode | null> {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Track a QR code scan
   */
  async trackScan(shortCode: string, metadata?: {
    ip_address?: string;
    user_agent?: string;
  }) {
    const { data, error } = await supabase.rpc('track_qr_scan', {
      p_short_code: shortCode,
      p_ip_address: metadata?.ip_address || null,
      p_user_agent: metadata?.user_agent || null,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Get QR code analytics for an event
   */
  async getAnalytics(eventId: string) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('scans_count, unique_scans_count, created_at')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Get all QR codes for an operator
   */
  async getOperatorQRCodes(operatorId: string) {
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*, events!inner(title, operator_id)')
      .eq('events.operator_id', operatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
