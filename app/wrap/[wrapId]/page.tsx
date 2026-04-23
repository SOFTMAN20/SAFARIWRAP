import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import GuestWrapPage from '@/components/wrap/GuestWrapPage';

interface WrapPageProps {
  params: Promise<{
    wrapId: string;
  }>;
}

export default async function WrapPage({ params }: WrapPageProps) {
  const { wrapId } = await params;

  console.log('🔍 Fetching wrap for ID:', wrapId);

  // Create Supabase server client
  const supabase = await createClient();

  // Fetch wrap data with review and event details
  const { data: wrap, error } = await supabase
    .from('wraps')
    .select(`
      *,
      reviews (
        *,
        events (
          *,
          operators (
            *
          )
        )
      )
    `)
    .eq('id', wrapId)
    .maybeSingle();

  if (error) {
    console.error('❌ Wrap fetch error:', {
      error,
      wrapId,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
      errorHint: error.hint,
    });
    
    // For errors, throw to show error page
    throw new Error(`Failed to fetch wrap: ${error.message}`);
  }

  if (!wrap) {
    console.error('Wrap not found for ID:', wrapId);
    notFound();
  }

  console.log('✅ Wrap fetched successfully:', {
    wrapId: wrap.id,
    guestName: wrap.guest_name,
    hasReview: !!wrap.reviews,
    hasEvent: !!wrap.reviews?.events,
    hasOperator: !!wrap.reviews?.events?.operators,
  });

  // Transform data for GuestWrapPage component
  const wrapData = {
    ...wrap,
    guest_name: wrap.guest_name,
    data: wrap.data,
    reviews: wrap.reviews,
    events: wrap.reviews?.events,
  };

  return <GuestWrapPage wrapData={wrapData} />;
}

export async function generateMetadata({ params }: WrapPageProps) {
  const { wrapId } = await params;
  const supabase = await createClient();

  const { data: wrap } = await supabase
    .from('wraps')
    .select('guest_name, data')
    .eq('id', wrapId)
    .single();

  if (!wrap) {
    return {
      title: 'Wrap Not Found',
    };
  }

  return {
    title: `${wrap.guest_name}'s Explorer Wrap | SafariWrap`,
    description: `Check out ${wrap.guest_name}'s amazing experience wrap!`,
    openGraph: {
      title: `${wrap.guest_name}'s Explorer Wrap`,
      description: `Check out ${wrap.guest_name}'s amazing experience!`,
      images: wrap.data?.guest_photos?.[0] ? [wrap.data.guest_photos[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${wrap.guest_name}'s Explorer Wrap`,
      description: `Check out ${wrap.guest_name}'s amazing experience!`,
      images: wrap.data?.guest_photos?.[0] ? [wrap.data.guest_photos[0]] : [],
    },
  };
}
