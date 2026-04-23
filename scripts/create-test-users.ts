/**
 * Create Test Users for SafariWrap
 * 
 * This script creates test users with auth accounts, profiles, operators, and sample data
 * 
 * Usage:
 *   npx tsx scripts/create-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'admin@safariwrap.com',
    password: 'Admin123!',
    role: 'admin',
    business: {
      name: 'SafariWrap Platform',
      phone: '+255 700 000 000',
      address: 'Dar es Salaam, Tanzania',
      website: 'https://safariwrap.com',
      color1: '#1B4D3E',
      color2: '#F4C542',
      metadata: { is_platform_admin: true }
    },
    subscription: 'enterprise'
  },
  {
    email: 'info@serengetisafari.com',
    password: 'Safari123!',
    role: 'operator',
    business: {
      name: 'Serengeti Safari Co',
      phone: '+255 754 123 456',
      address: 'Arusha, Tanzania',
      website: 'https://serengetisafari.com',
      color1: '#2C5F2D',
      color2: '#FFB84D',
      metadata: {
        specialties: ['Big Five', 'Migration', 'Photography'],
        years_experience: 15,
        languages: ['English', 'Swahili', 'German']
      }
    },
    subscription: 'pro',
    events: [
      {
        title: 'Great Migration Safari 2026',
        location: 'Serengeti National Park',
        start_date: '2026-07-15',
        end_date: '2026-07-22',
        status: 'upcoming',
        metadata: {
          destinations: ['Serengeti', 'Ngorongoro'],
          group_size: 8,
          difficulty: 'moderate',
          highlights: ['Wildebeest Migration', 'Big Five', 'Hot Air Balloon']
        }
      },
      {
        title: 'Luxury Serengeti Experience',
        location: 'Serengeti National Park',
        start_date: '2026-03-10',
        end_date: '2026-03-15',
        status: 'completed',
        metadata: {
          destinations: ['Serengeti'],
          group_size: 4,
          difficulty: 'easy',
          accommodation: 'luxury_lodge',
          highlights: ['Big Five', 'Sundowner', 'Bush Dinner']
        },
        reviews: [
          {
            guest_name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            star_rating: 5,
            review_text: 'Absolutely incredible experience! Our guide was knowledgeable and we saw all of the Big Five.',
            safari_duration: '5 days',
            big_five_seen: 'Lion,Leopard,Elephant,Buffalo,Rhino',
            other_animals: 'Cheetah,Giraffe,Zebra,Wildebeest',
            memorable_moment: 'Watching a pride of lions hunt at sunset was breathtaking!',
            data_consent: true,
            marketing_consent: true
          },
          {
            guest_name: 'Michael Chen',
            email: 'mchen@email.com',
            star_rating: 5,
            review_text: 'Best safari of my life! Professional team, amazing wildlife sightings.',
            safari_duration: '5 days',
            big_five_seen: 'Lion,Elephant,Buffalo',
            other_animals: 'Cheetah,Hyena,Giraffe,Zebra,Hippo',
            memorable_moment: 'The hot air balloon ride over the Serengeti at sunrise was magical.',
            data_consent: true,
            marketing_consent: false
          }
        ]
      }
    ]
  },
  {
    email: 'bookings@kiliadventures.com',
    password: 'Safari123!',
    role: 'operator',
    business: {
      name: 'Kilimanjaro Adventures',
      phone: '+255 765 234 567',
      address: 'Moshi, Tanzania',
      website: 'https://kiliadventures.com',
      color1: '#8B4513',
      color2: '#F4A460',
      metadata: {
        specialties: ['Mountain Climbing', 'Safari', 'Cultural Tours'],
        years_experience: 20,
        languages: ['English', 'Swahili', 'French']
      }
    },
    subscription: 'pro',
    events: [
      {
        title: 'Kilimanjaro Base Safari',
        location: 'Amboseli National Park',
        start_date: '2026-06-01',
        end_date: '2026-06-05',
        status: 'upcoming',
        metadata: {
          destinations: ['Amboseli', 'Tarangire'],
          group_size: 12,
          difficulty: 'easy',
          highlights: ['Elephant Herds', 'Kilimanjaro Views', 'Maasai Village']
        }
      }
    ]
  },
  {
    email: 'contact@ngorongoroexp.com',
    password: 'Safari123!',
    role: 'operator',
    business: {
      name: 'Ngorongoro Expeditions',
      phone: '+255 776 345 678',
      address: 'Karatu, Tanzania',
      website: 'https://ngorongoroexp.com',
      color1: '#4A5D23',
      color2: '#D4AF37',
      metadata: {
        specialties: ['Crater Tours', 'Wildlife', 'Luxury Safari'],
        years_experience: 12,
        languages: ['English', 'Swahili', 'Italian']
      }
    },
    subscription: 'free',
    events: [
      {
        title: 'Crater Exploration Safari',
        location: 'Ngorongoro Crater',
        start_date: '2026-03-20',
        end_date: '2026-03-23',
        status: 'completed',
        metadata: {
          destinations: ['Ngorongoro'],
          group_size: 6,
          difficulty: 'moderate',
          highlights: ['Black Rhino', 'Crater Floor', 'Maasai Culture']
        },
        reviews: [
          {
            guest_name: 'Emma Williams',
            email: 'emma.w@email.com',
            star_rating: 5,
            review_text: 'The Ngorongoro Crater is absolutely stunning! We saw black rhinos.',
            safari_duration: '3 days',
            big_five_seen: 'Lion,Elephant,Buffalo,Rhino',
            other_animals: 'Zebra,Wildebeest,Flamingo,Hippo',
            memorable_moment: 'Seeing the endangered black rhino in the crater was a dream come true!',
            data_consent: true,
            marketing_consent: true
          }
        ]
      }
    ]
  },
  {
    email: 'hello@tarangiretours.com',
    password: 'Safari123!',
    role: 'operator',
    business: {
      name: 'Tarangire Tours',
      phone: '+255 787 456 789',
      address: 'Arusha, Tanzania',
      website: 'https://tarangiretours.com',
      color1: '#8B7355',
      color2: '#FFD700',
      metadata: {
        specialties: ['Elephant Watching', 'Bird Safari', 'Walking Tours'],
        years_experience: 8,
        languages: ['English', 'Swahili']
      }
    },
    subscription: 'free',
    events: [
      {
        title: 'Elephant Paradise Safari',
        location: 'Tarangire National Park',
        start_date: '2026-08-10',
        end_date: '2026-08-14',
        status: 'upcoming',
        metadata: {
          destinations: ['Tarangire', 'Lake Manyara'],
          group_size: 10,
          difficulty: 'easy',
          highlights: ['Elephant Herds', 'Baobab Trees', 'Bird Watching']
        }
      }
    ]
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users for SafariWrap...\n');

  for (const userData of testUsers) {
    try {
      console.log(`📧 Creating user: ${userData.email}`);

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          business_name: userData.business.name
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  User already exists, skipping...`);
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;
      console.log(`   ✅ Auth user created: ${userId}`);

      // 2. Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: userData.role })
        .eq('id', userId);

      if (profileError) throw profileError;
      console.log(`   ✅ Profile role set to: ${userData.role}`);

      // 3. Update operator business data
      const { error: operatorError } = await supabase
        .from('operators')
        .update({
          business_name: userData.business.name,
          phone: userData.business.phone,
          address: userData.business.address,
          website_url: userData.business.website,
          brand_color_1: userData.business.color1,
          brand_color_2: userData.business.color2,
          metadata: userData.business.metadata
        })
        .eq('id', userId);

      if (operatorError) throw operatorError;
      console.log(`   ✅ Operator business data updated`);

      // 4. Update subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          plan: userData.subscription,
          status: 'active',
          expires_at: userData.subscription === 'free' ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('operator_id', userId);

      if (subError) throw subError;
      console.log(`   ✅ Subscription set to: ${userData.subscription}`);

      // 5. Create events
      if (userData.events) {
        for (const eventData of userData.events) {
          const { data: event, error: eventError } = await supabase
            .from('events')
            .insert({
              operator_id: userId,
              type: 'safari',
              title: eventData.title,
              location: eventData.location,
              start_date: eventData.start_date,
              end_date: eventData.end_date,
              status: eventData.status,
              metadata: eventData.metadata
            })
            .select()
            .single();

          if (eventError) throw eventError;
          console.log(`   ✅ Event created: ${eventData.title}`);

          // 6. Create reviews for completed events
          if (eventData.reviews && eventData.status === 'completed') {
            for (const reviewData of eventData.reviews) {
              const { error: reviewError } = await supabase
                .from('reviews')
                .insert({
                  event_id: event.id,
                  trip_id: event.id, // For backward compatibility
                  ...reviewData
                });

              if (reviewError) throw reviewError;
              console.log(`   ✅ Review added: ${reviewData.guest_name}`);
            }
          }
        }
      }

      console.log(`✨ ${userData.business.name} setup complete!\n`);

    } catch (error: any) {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
      console.error(error);
    }
  }

  console.log('🎉 All test users created successfully!\n');
  
  // Show summary
  const { data: summary } = await supabase
    .from('profiles')
    .select(`
      email,
      role,
      operators (business_name),
      subscriptions (plan, status)
    `)
    .in('role', ['operator', 'admin']);

  console.log('📊 Summary:');
  console.table(summary?.map(u => ({
    Email: u.email,
    Role: u.role,
    Business: (u.operators as any)?.business_name,
    Plan: (u.subscriptions as any)?.plan
  })));
}

createTestUsers().catch(console.error);
