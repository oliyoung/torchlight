/**
 * Comprehensive authentication testing script for both login and signup.
 * Provides command-line testing for all authentication endpoints.
 * 
 * @fileoverview Command-line utility to test authentication with both Supabase client and REST API
 * @usage node scripts/test-auth.js <action> <email> <password>
 * @example
 * ```bash
 * # Register new user
 * node scripts/test-auth.js signup newuser@example.com password123
 * 
 * # Login existing user
 * node scripts/test-auth.js login user@example.com password123
 * 
 * # Test REST API login
 * node scripts/test-auth.js api-login user@example.com password123
 * 
 * # Test REST API register
 * node scripts/test-auth.js api-register newuser@example.com password123
 * ```
 */

// Load environment variables
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Tests Supabase client login functionality.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<void>}
 */
async function testSupabaseLogin(email, password) {
  console.log('🔐 Testing Supabase Client Login...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }

    console.log('✅ Supabase login successful!');
    console.log('📧 User:', data.user.email);
    console.log('🆔 User ID:', data.user.id);
    console.log('🔑 Access Token:', data.session.access_token);
    
    return data.session.access_token;
  } catch (error) {
    console.error('❌ Supabase login error:', error.message);
  }
}

/**
 * Tests Supabase client signup functionality.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<void>}
 */
async function testSupabaseSignup(email, password) {
  console.log('📝 Testing Supabase Client Signup...');
  
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error('❌ Signup failed:', error.message);
      return;
    }

    console.log('✅ Supabase signup successful!');
    console.log('📧 User:', data.user.email);
    console.log('🆔 User ID:', data.user.id);
    
    if (data.session?.access_token) {
      console.log('✨ Immediate login successful!');
      console.log('🔑 Access Token:', data.session.access_token);
      return data.session.access_token;
    } else {
      console.log('📨 Email confirmation required');
    }
  } catch (error) {
    console.error('❌ Supabase signup error:', error.message);
  }
}

/**
 * Tests REST API login endpoint.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<string|null>} Access token if successful
 */
async function testRestLogin(email, password) {
  console.log('🌐 Testing REST API Login...');
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.access_token) {
      console.log('✅ REST API login successful!');
      console.log('🔑 Access Token:', data.access_token);
      return data.access_token;
    } else {
      console.error('❌ REST API login failed:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ REST API login error:', error.message);
  }
  
  return null;
}

/**
 * Tests REST API register endpoint.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<string|null>} Access token if successful
 */
async function testRestRegister(email, password) {
  console.log('🌐 Testing REST API Register...');
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      if (data.access_token) {
        console.log('✅ REST API register successful with immediate login!');
        console.log('🔑 Access Token:', data.access_token);
        return data.access_token;
      } else {
        console.log('✅ REST API register successful!');
        console.log('📨 Message:', data.message || 'Registration completed');
        if (data.user_id) {
          console.log('🆔 User ID:', data.user_id);
        }
      }
    } else {
      console.error('❌ REST API register failed:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ REST API register error:', error.message);
  }
  
  return null;
}

/**
 * Tests GraphQL endpoint with authentication token.
 * 
 * @param {string} token - JWT access token
 * @returns {Promise<void>}
 */
async function testGraphQLWithToken(token) {
  console.log('🚀 Testing GraphQL with authentication...');
  
  try {
    const response = await fetch(`${baseUrl}/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: 'query { athletes { id name sport } }'
      })
    });

    const data = await response.json();

    if (response.ok && !data.errors) {
      console.log('✅ GraphQL request successful!');
      console.log('📊 Data received:', JSON.stringify(data.data, null, 2));
    } else {
      console.error('❌ GraphQL request failed:', data.errors || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ GraphQL request error:', error.message);
  }
}

/**
 * Main testing function that coordinates all tests.
 * 
 * @param {string} action - Test action to perform
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<void>}
 */
async function runTests(action, email, password) {
  console.log(`\n🧪 Testing ${action} for ${email}\n`);
  
  let token = null;
  
  switch (action) {
    case 'login':
      token = await testSupabaseLogin(email, password);
      break;
    case 'signup':
      token = await testSupabaseSignup(email, password);
      break;
    case 'api-login':
      token = await testRestLogin(email, password);
      break;
    case 'api-register':
      token = await testRestRegister(email, password);
      break;
    case 'all':
      console.log('🔄 Running all tests...\n');
      token = await testSupabaseLogin(email, password);
      if (!token) token = await testRestLogin(email, password);
      break;
    default:
      console.error('❌ Unknown action:', action);
      showUsage();
      return;
  }
  
  // Test GraphQL if we got a token
  if (token) {
    console.log('\n' + '='.repeat(50));
    await testGraphQLWithToken(token);
  }
  
  console.log('\n✨ Test completed!');
}

/**
 * Shows usage information and examples.
 */
function showUsage() {
  console.log('Usage: node scripts/test-auth.js <action> <email> <password>');
  console.log('');
  console.log('Actions:');
  console.log('  login        - Test Supabase client login');
  console.log('  signup       - Test Supabase client signup');
  console.log('  api-login    - Test REST API login endpoint');
  console.log('  api-register - Test REST API register endpoint');
  console.log('  all          - Test login with fallback to REST API');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/test-auth.js signup newuser@example.com password123');
  console.log('  node scripts/test-auth.js login user@example.com password123');
  console.log('  node scripts/test-auth.js api-login user@example.com password123');
  console.log('  node scripts/test-auth.js all user@example.com password123');
}

// Parse command line arguments
const action = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!action || !email || !password) {
  showUsage();
  process.exit(1);
}

runTests(action, email, password);