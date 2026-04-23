import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import GuestWrapPage from '@/components/wrap/GuestWrapPage';

/**
 * Public wrap access via share token
 * ✅ NEW: Uses share_token for secure public sharing
 * URL: /wrap/share/{share_token}
 */
async function getWrapByShareToken(shareToken: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Use get_wrap_by_share_token() helper function
  const { data: wrapResult, error: wrapError } = await supabase
    .rpc('get_wrap_by_share_token', { token: shareToken });

  if (wrapError || !wrapResult || wrapResult.length === 0) {
    console.error('Wrap fetch error:', wrapError);
    return null;
  }

  const wrap = wrapResult[0];

  // Fetch related data (review, event, operator)
  const { data: review } = await supabase
    .from('reviews')
    .select(`
      id,
      guest_name,
      email,
      rating,
      comment,
      photo_urls,
      memorable_moment,
      metadata,
      created_at,
      star_rating,
      review_text
    `)
    .eq('id', wrap.review_id)
    .maybeSingle();

  const { data: event } = await supabase
    .from('events')
    .select(`
      id,
      title,
      location,
      start_date,
      end_date,
      type,
      metadata,
      operator_id,
      operators (
        id,
        business_name,
        logo_url,
        brand_color_1,
        brand_color_2
      )
    `)
    .eq('id', wrap.event_id)
    .maybeSingle();

  // Combine data
  return {
    ...wrap,
    reviews: review,
    events: event,
  };
}

export default async function ShareWrapPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const wrap = await getWrapByShareToken(shareToken);

  if (!wrap) {
    notFound();
  }

  return <GuestWrapPage wrapData={wrap} />;
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const wrap = await getWrapByShareToken(shareToken);

  if (!wrap) {
    return {
      title: 'Wrap Not Found',
    };
  }

  return {
    title: `${wrap.guest_name}'s ${wrap.events?.title || 'Experience'} Wrap`,
    description: `Check out ${wrap.guest_name}'s amazing ${wrap.events?.type || 'experience'} wrap!`,
    openGraph: {
      title: `${wrap.guest_name}'s ${wrap.events?.title || 'Experience'} Wrap`,
      description: `Check out ${wrap.guest_name}'s amazing ${wrap.events?.type || 'experience'} wrap!`,
      images: wrap.reviews?.photo_urls?.[0] ? [wrap.reviews.photo_urls[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${wrap.guest_name}'s ${wrap.events?.title || 'Experience'} Wrap`,
      description: `Check out ${wrap.guest_name}'s amazing ${wrap.events?.type || 'experience'} wrap!`,
      images: wrap.reviews?.photo_urls?.[0] ? [wrap.reviews.photo_urls[0]] : [],
    },
  };
}
