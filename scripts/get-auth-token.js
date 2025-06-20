/**
 * Script to get an auth token for GraphQL testing
 * Usage: node scripts/get-auth-token.js <email> <password>
 */

// Load environment variables
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getAuthToken(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication failed:', error.message);
      return;
    }

    console.log('🎉 Authentication successful!');
    console.log('📧 User:', data.user.email);
    console.log('🆔 User ID:', data.user.id);
    console.log('🔑 Access Token:');
    console.log(data.session.access_token);
    console.log('\n📋 Use this in your GraphQL client:');
    console.log(`Authorization: Bearer ${data.session.access_token}`);
    console.log('\n📝 Example cURL:');
    console.log(`curl -X POST http://localhost:3000/api/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${data.session.access_token}" \\
  -d '{"query": "query { assistants { id name bio } }"}'`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get email and password from command line args
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node scripts/get-auth-token.js <email> <password>');
  console.log('Example: node scripts/get-auth-token.js test@example.com mypassword');
  process.exit(1);
}

getAuthToken(email, password);