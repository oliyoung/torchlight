#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This would be needed for admin operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const TEST_EMAIL = 'playwright.test@gmail.com';

async function confirmTestUserEmail() {
  console.log('📧 Confirming test user email for Playwright tests...');
  console.log(`📧 Email: ${TEST_EMAIL}`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  console.log('\n🔧 To fix the "Email not confirmed" issue, you have two options:\n');

  console.log('📋 OPTION 1: Disable email confirmation (Recommended for testing)');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Authentication > Settings');
  console.log('4. Find "Enable email confirmations" and toggle it OFF');
  console.log('5. Save the changes');
  console.log('6. This will allow signup without email confirmation for testing\n');

  console.log('📋 OPTION 2: Manually confirm the user email');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Authentication > Users');
  console.log(`4. Find the user: ${TEST_EMAIL}`);
  console.log('5. Click on the user');
  console.log('6. Toggle "Email Confirmed" to ON');
  console.log('7. Save the changes\n');

  console.log('🎯 RECOMMENDED: Use Option 1 for testing environments');
  console.log('   This makes tests more reliable and doesn\'t require manual intervention\n');

  // Try to verify current user status
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: 'TestPassword123!',
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        console.log('❌ User email is still not confirmed');
        console.log('   Please follow one of the options above to fix this');
      } else {
        console.log('❌ Different authentication error:', error.message);
      }
    } else {
      console.log('✅ User authentication successful! Email is confirmed.');
      console.log('   You can now run your Playwright tests');
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.log('❌ Error checking user status:', error);
  }

  console.log('\n🚀 After fixing the email confirmation, run:');
  console.log('   npx playwright test');
}

confirmTestUserEmail();