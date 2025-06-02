# Authentication Testing Guide

## Why the auth login request in requests.http might not work

### ❌ **Common Issues:**

1. **Server not running**
   ```bash
   # Start the dev server first
   yarn dev
   ```

2. **User doesn't exist**
   ```bash
   # Create a test user first
   node scripts/signup-user.js test@example.com password123
   ```

3. **Wrong credentials**
   ```bash
   # Use the exact email/password you created
   # Default in requests.http: test@example.com / password123
   ```

4. **Environment variables missing**
   ```bash
   # Check .env file has:
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## ✅ **Step-by-step troubleshooting:**

### 1. Start the server
```bash
yarn dev
```

### 2. Create a test user
```bash
node scripts/signup-user.js test@example.com password123
```

### 3. Test the endpoint with cURL
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Expected response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Use the token in GraphQL requests
Replace `YOUR_TOKEN_HERE` in requests.http with the actual token from step 3.

## 🛠 **Alternative testing methods:**

### Use test scripts
```bash
# Test all auth methods
node scripts/test-auth.js all test@example.com password123

# Test just REST API
node scripts/test-auth.js api-login test@example.com password123
```

### Use browser dev tools
1. Open browser to `http://localhost:3000/login`
2. Sign in with test credentials
3. Open dev tools → Application → Local Storage
4. Find `supabase-auth-token` for the JWT

## 🔧 **Debugging common errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid login credentials` | User doesn't exist | Create user first |
| `Missing Supabase environment variables` | Missing .env | Check environment setup |
| `Cannot find module` | Dependencies missing | Run `yarn install` |
| `ECONNREFUSED` | Server not running | Run `yarn dev` |
| `Unexpected token '<'` | Server returned HTML | Check server is running on port 3000 |

## 📝 **Working example:**

1. Create user: `node scripts/signup-user.js coach@test.com mypassword`
2. Get token: `node scripts/get-auth-token.js coach@test.com mypassword`  
3. Use token in requests.http: `Authorization: Bearer eyJhbGci...`