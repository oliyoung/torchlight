/**
 * Script to register a new user and get an auth token for GraphQL testing.
 * Provides command-line user registration with Supabase.
 * 
 * @fileoverview Command-line utility to register new users and get authentication tokens
 * @usage node scripts/signup-user.js <email> <password>
 * @example
 * ```bash
 * # Register a new user
 * node scripts/signup-user.js newuser@example.com password123
 * ```
 */

// Load environment variables
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Registers a new user and retrieves authentication token.
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password (minimum 6 characters)
 * @returns {Promise<void>}
 * 
 * @example
 * ```javascript
 * await signupUser('user@example.com', 'password123')
 * // Outputs registration result and token if successful
 * ```
 */
async function signupUser(email, password) {
  try {
    // Validate password length
    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters long');
      return;
    }

    console.log('📝 Registering new user...');
    console.log('📧 Email:', email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ Registration failed:', error.message);
      return;
    }

    // Check if user was created
    if (!data.user) {
      console.error('❌ Registration failed: No user data returned');
      return;
    }

    console.log('🎉 Registration successful!');
    console.log('📧 User Email:', data.user.email);
    console.log('🆔 User ID:', data.user.id);

    // Check if session was created immediately (no email confirmation required)
    if (data.session?.access_token) {
      console.log('✨ User logged in immediately!');
      console.log('🔑 Access Token:');
      console.log(data.session.access_token);
      console.log('\n📋 Use this in your GraphQL client:');
      console.log(`Authorization: Bearer ${data.session.access_token}`);
      console.log('\n📝 Example cURL:');
      console.log(`curl -X POST http://localhost:3000/api/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${data.session.access_token}" \\
  -d '{"query": "query { athletes { id name sport } }"}'`);
      
      console.log('\n🚀 You can now use the REST API:');
      console.log(`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "${email}", "password": "${password}"}'`);
    } else {
      console.log('📨 Email confirmation required!');
      console.log('   Check your email for a confirmation link');
      console.log('   After confirming, use the signin script to get a token:');
      console.log(`   node scripts/get-auth-token.js ${email} ${password}`);
    }

    // Show user confirmation status
    if (data.user.email_confirmed_at) {
      console.log('✅ Email already confirmed');
    } else {
      console.log('⏳ Email confirmation pending');
    }

  } catch (error) {
    console.error('❌ Error during registration:', error.message);
  }
}

// Parse command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node scripts/signup-user.js <email> <password>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/signup-user.js newuser@example.com password123');
  console.log('  node scripts/signup-user.js coach@sports.com supersecret');
  console.log('');
  console.log('Requirements:');
  console.log('  - Email must be valid format');
  console.log('  - Password must be at least 6 characters');
  console.log('');
  console.log('After registration:');
  console.log('  - Check email for confirmation link (if required)');
  console.log('  - Use signin script to get auth token');
  process.exit(1);
}

signupUser(email, password);