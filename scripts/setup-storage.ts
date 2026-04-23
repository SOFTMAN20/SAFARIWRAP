/**
 * Setup Supabase Storage Buckets
 * 
 * This script ensures all required storage buckets exist with proper configuration.
 * Run with: npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\nMake sure .env.local exists with these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorageBuckets() {
  console.log('🚀 Setting up Supabase Storage buckets...\n');

  const bucketsToCreate = [
    {
      name: 'safariwrap-assets',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    }
  ];

  for (const bucketConfig of bucketsToCreate) {
    console.log(`📦 Checking bucket: ${bucketConfig.name}`);

    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`❌ Error listing buckets:`, listError.message);
      continue;
    }

    const bucketExists = existingBuckets?.some(b => b.name === bucketConfig.name);

    if (bucketExists) {
      console.log(`✅ Bucket "${bucketConfig.name}" already exists`);
      
      // Update bucket to ensure it's public
      const { error: updateError } = await supabase.storage.updateBucket(bucketConfig.name, {
        public: bucketConfig.public,
        fileSizeLimit: bucketConfig.fileSizeLimit,
        allowedMimeTypes: bucketConfig.allowedMimeTypes,
      });

      if (updateError) {
        console.log(`⚠️  Could not update bucket settings: ${updateError.message}`);
      } else {
        console.log(`✅ Bucket settings updated`);
      }
    } else {
      console.log(`📦 Creating bucket: ${bucketConfig.name}`);
      
      const { data, error: createError } = await supabase.storage.createBucket(bucketConfig.name, {
        public: bucketConfig.public,
        fileSizeLimit: bucketConfig.fileSizeLimit,
        allowedMimeTypes: bucketConfig.allowedMimeTypes,
      });

      if (createError) {
        console.error(`❌ Error creating bucket:`, createError.message);
      } else {
        console.log(`✅ Bucket "${bucketConfig.name}" created successfully`);
      }
    }

    console.log('');
  }

  // Test upload to verify bucket is working
  console.log('🧪 Testing file upload...');
  
  const testFileName = `test-${Date.now()}.txt`;
  const testContent = 'SafariWrap storage test';
  
  const { error: uploadError } = await supabase.storage
    .from('safariwrap-assets')
    .upload(testFileName, testContent, {
      contentType: 'text/plain',
    });

  if (uploadError) {
    console.error('❌ Test upload failed:', uploadError.message);
  } else {
    console.log('✅ Test upload successful');
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('safariwrap-assets')
      .getPublicUrl(testFileName);
    
    console.log('📎 Test file URL:', urlData.publicUrl);
    
    // Clean up test file
    await supabase.storage
      .from('safariwrap-assets')
      .remove([testFileName]);
    
    console.log('🧹 Test file cleaned up');
  }

  console.log('\n✨ Storage setup complete!');
}

setupStorageBuckets().catch(console.error);
