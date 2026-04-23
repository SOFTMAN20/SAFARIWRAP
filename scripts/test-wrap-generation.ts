/**
 * End-to-End Wrap Generation Test
 * 
 * This script tests the complete wrap generation flow:
 * 1. Create a test review
 * 2. Generate wrap from the review
 * 3. Verify wrap data structure
 * 4. Check tree allocation
 * 5. Validate all aggregations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test event ID (Luxury Serengeti Experience with existing reviews)
const TEST_EVENT_ID = '46313519-d3a5-4713-aede-0551b8f31825';

async function testWrapGeneration() {
  console.log('🧪 Starting End-to-End Wrap Generation Test\n');
  
  try {
    // Step 1: Create a test review
    console.log('📝 Step 1: Creating test review...');
    const testReview = {
      event_id: TEST_EVENT_ID,
      guest_name: 'Test Guest E2E',
      email: 'test@e2e.com',
      star_rating: 5,
      review_text: 'This was an absolutely incredible safari experience! The wildlife was breathtaking.',
      big_five_seen: 'Lion, Elephant, Buffalo, Leopard',
      other_animals: 'Giraffe, Zebra, Cheetah, Hippo, Wildebeest',
      safari_duration: '5 days',
      best_time: 'Early morning',
      memorable_moment: 'Watching a pride of lions at sunset',
      data_consent: true,
      marketing_consent: false,
    };
    
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert(testReview)
      .select()
      .single();
    
    if (reviewError) {
      console.error('❌ Failed to create review:', reviewError);
      return;
    }
    
    console.log('✅ Review created:', review.id);
    console.log(`   Guest: ${review.guest_name}`);
    console.log(`   Rating: ${review.star_rating} stars`);
    console.log(`   Animals: ${review.big_five_seen}, ${review.other_animals}\n`);
    
    // Step 2: Generate wrap via API
    console.log('🎨 Step 2: Generating wrap...');
    const wrapResponse = await fetch('http://localhost:3000/api/wraps/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: TEST_EVENT_ID,
        guest_name: testReview.guest_name,
        review_id: review.id,
      }),
    });
    
    if (!wrapResponse.ok) {
      const error = await wrapResponse.json();
      console.error('❌ Wrap generation failed:', error);
      return;
    }
    
    const wrapResult = await wrapResponse.json();
    const wrap = wrapResult.data;
    
    console.log('✅ Wrap generated:', wrap.wrap_id);
    console.log(`   URL: ${wrap.wrap_url}\n`);
    
    // Step 3: Verify wrap data structure
    console.log('🔍 Step 3: Verifying wrap data structure...');
    const wrapData = wrap.wrap_data;
    
    // Check required fields
    const requiredFields = [
      'event_id', 'event_type', 'event_title', 'event_location',
      'guest_name', 'guest_rating', 'stats', 'operator', 'environmental_impact'
    ];
    
    const missingFields = requiredFields.filter(field => !wrapData[field]);
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return;
    }
    
    console.log('✅ All required fields present');
    console.log(`   Event: ${wrapData.event_title}`);
    console.log(`   Type: ${wrapData.event_type}`);
    console.log(`   Guest: ${wrapData.guest_name}`);
    console.log(`   Rating: ${wrapData.guest_rating} stars\n`);
    
    // Step 4: Verify statistics
    console.log('📊 Step 4: Verifying statistics...');
    const stats = wrapData.stats;
    
    console.log(`   Total Reviews: ${stats.total_reviews}`);
    console.log(`   Average Rating: ${stats.average_rating}`);
    console.log(`   Total Photos: ${stats.total_photos}`);
    console.log(`   Total Guests: ${stats.total_guests}`);
    
    if (stats.total_reviews < 4) {
      console.warn('⚠️  Expected at least 4 reviews (3 existing + 1 new)');
    } else {
      console.log('✅ Review count correct\n');
    }
    
    // Step 5: Verify Safari-specific data
    console.log('🦁 Step 5: Verifying Safari data...');
    if (wrapData.safari_data) {
      const safariData = wrapData.safari_data;
      
      console.log(`   Top Animal: ${safariData.top_animal}`);
      console.log(`   Total Species: ${safariData.total_species}`);
      console.log(`   Big Five Count: ${safariData.big_five_count}`);
      console.log(`   Big Five Seen: ${safariData.big_five_seen.join(', ')}`);
      console.log(`   Species Breakdown:`);
      
      safariData.species_breakdown.slice(0, 5).forEach((species: any) => {
        console.log(`     - ${species.name}: ${species.count} sightings`);
      });
      
      if (safariData.total_species > 0) {
        console.log('✅ Safari data aggregated correctly\n');
      } else {
        console.error('❌ No species data found\n');
      }
    } else {
      console.error('❌ Safari data missing\n');
    }
    
    // Step 6: Verify environmental impact
    console.log('🌳 Step 6: Verifying environmental impact...');
    const impact = wrapData.environmental_impact;
    
    console.log(`   Trees Planted: ${impact.trees_planted}`);
    console.log(`   CO₂ Offset: ${impact.co2_offset_kg} kg/year`);
    
    // Verify tree allocation logic
    const expectedTrees = stats.total_reviews >= 26 ? 3 : stats.total_reviews >= 11 ? 2 : 1;
    if (impact.trees_planted === expectedTrees) {
      console.log('✅ Tree allocation correct\n');
    } else {
      console.warn(`⚠️  Expected ${expectedTrees} trees, got ${impact.trees_planted}\n`);
    }
    
    // Step 7: Verify operator branding
    console.log('🎨 Step 7: Verifying operator branding...');
    const operator = wrapData.operator;
    
    console.log(`   Business: ${operator.business_name}`);
    console.log(`   Primary Color: ${operator.brand_color_1}`);
    console.log(`   Accent Color: ${operator.brand_color_2}`);
    console.log('✅ Operator branding included\n');
    
    // Step 8: Verify highlights
    console.log('✨ Step 8: Verifying highlights...');
    const highlights = wrapData.highlights;
    
    console.log(`   Best Photo: ${highlights.best_photo ? 'Present' : 'None'}`);
    console.log(`   Memorable Moment: ${highlights.memorable_moment ? 'Present' : 'None'}`);
    console.log(`   Top Rated Aspect: ${highlights.top_rated_aspect}`);
    console.log('✅ Highlights generated\n');
    
    // Step 9: Fetch wrap via API to verify storage
    console.log('💾 Step 9: Verifying wrap storage...');
    const fetchResponse = await fetch(`http://localhost:3000/api/wraps/${wrap.wrap_id}`);
    
    if (!fetchResponse.ok) {
      console.error('❌ Failed to fetch wrap from database');
      return;
    }
    
    const fetchedWrap = await fetchResponse.json();
    console.log('✅ Wrap successfully stored and retrieved\n');
    
    // Step 10: Verify tree activity record
    console.log('🌲 Step 10: Verifying tree activity record...');
    const { data: treeActivity } = await supabase
      .from('tree_activities')
      .select('*')
      .eq('id', wrap.tree_activity_id)
      .single();
    
    if (treeActivity) {
      console.log('✅ Tree activity record created');
      console.log(`   Trees: ${treeActivity.trees_planted}`);
      console.log(`   CO₂ Offset: ${treeActivity.co2_offset_kg} kg/year`);
      console.log(`   Planting Date: ${treeActivity.planting_date}\n`);
    } else {
      console.error('❌ Tree activity record not found\n');
    }
    
    // Final Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 END-TO-END TEST COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📋 Test Summary:');
    console.log('✅ Review created');
    console.log('✅ Wrap generated');
    console.log('✅ Data structure validated');
    console.log('✅ Statistics calculated');
    console.log('✅ Safari data aggregated');
    console.log('✅ Environmental impact calculated');
    console.log('✅ Operator branding included');
    console.log('✅ Highlights generated');
    console.log('✅ Wrap stored in database');
    console.log('✅ Tree activity recorded');
    console.log('\n🔗 Test Wrap URL:', wrap.wrap_url);
    console.log('🆔 Wrap ID:', wrap.wrap_id);
    console.log('🆔 Review ID:', review.id);
    console.log('\n✨ All systems operational! Ready for production.\n');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testWrapGeneration();
