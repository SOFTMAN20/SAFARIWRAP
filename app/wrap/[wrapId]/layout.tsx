import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

async function getWrapData(wrapId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Use new wraps table with events
  const { data } = await supabase
    .from('wraps')
    .select(`
      *,
      reviews (
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
        review_text,
        big_five_seen,
        other_animals
      ),
      events (
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
      )
    `)
    .eq('id', wrapId)
    .maybeSingle();

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ wrapId: string }>;
}): Promise<Metadata> {
  const { wrapId } = await params;
  const wrap = await getWrapData(wrapId);

  if (!wrap) {
    return {
      title: 'SafariWrap | Your Safari, Wrapped',
      description: 'View this personalized safari memory wrap.',
    };
  }

  // ✅ Use new schema structure
  const { events: event, reviews: review } = wrap;
  const operator = event?.operators;

  const guestName = review?.guest_name || 'Explorer';
  const eventTitle = event?.title || 'Safari';
  const rating = review?.rating || review?.star_rating || 0;
  const operatorName = operator?.business_name || 'Safari Operator';

  const animalCount = [
    ...(review?.big_five_seen ? review.big_five_seen.split(',').filter(Boolean) : []),
    ...(review?.other_animals ? review.other_animals.split(',').filter(Boolean) : []),
  ].length;

  const title = `${guestName}'s Safari Explorer Wrap | ${operatorName}`;
  const description = `${guestName} spotted ${animalCount} species on their ${eventTitle} with ${rating}/5 satisfaction. Experience their safari adventure — presented by ${operatorName}.`;

  const ogImageUrl = `/wrap/${wrapId}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${guestName}'s Safari Explorer Wrap`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function WrapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
