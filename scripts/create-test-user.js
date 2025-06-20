#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TEST_EMAIL = process.env.TEST_COACH_EMAIL || 'playwright.test@gmail.com';
const TEST_PASSWORD = process.env.TEST_COACH_PASSWORD || 'TestPassword123!';

async function createTestUser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('🔐 Creating test user for Playwright tests...');
  console.log(`📧 Email: ${TEST_EMAIL}`);

  try {
    // Try to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        console.log('✅ Test user already exists!');

        // Try to sign in to verify credentials work
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

        if (signInError) {
          console.error('❌ Test user exists but credentials don\'t work:', signInError.message);
          console.log('💡 You may need to manually delete the user in Supabase Auth and run this script again');
        } else {
          console.log('✅ Test user credentials verified!');
          // Sign out after verification
          await supabase.auth.signOut();
        }
      } else {
        console.error('❌ Error creating test user:', error.message);
        console.log('\n💡 Possible solutions:');
        console.log('  1. Check if your Supabase project allows new user signups');
        console.log('  2. Verify email confirmation settings in Supabase Auth');
        console.log('  3. Try creating the user manually in Supabase dashboard');
        process.exit(1);
      }
    } else {
      console.log('✅ Test user created successfully!');
      console.log('🆔 User ID:', data.user?.id);

      if (data.user?.email_confirmed_at) {
        console.log('✅ Email confirmed automatically');
      } else {
        console.log('📧 Email confirmation may be required (check your Supabase Auth settings)');
      }
    }

    console.log('\n🎉 Test user setup complete!');
    console.log(`📝 Add these to your .env file for testing:`);
    console.log(`TEST_COACH_EMAIL=${TEST_EMAIL}`);
    console.log(`TEST_COACH_PASSWORD=${TEST_PASSWORD}`);
    console.log('\nNow you can run your Playwright tests:');
    console.log('  npx playwright test');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

createTestUser();