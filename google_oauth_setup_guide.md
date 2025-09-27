# Google OAuth Setup Guide for AgriLink

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "AgriLink OAuth")
4. Click "Create"

### 1.2 Enable Google+ API
1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity" API

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Configure the OAuth consent screen if prompted

### 1.4 Configure OAuth Client
1. **Name**: AgriLink Web Client
2. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
   - `https://ubtayveusmjsfmsekhkg.supabase.co` (your Supabase URL)

3. **Authorized redirect URIs**:
   - `https://ubtayveusmjsfmsekhkg.supabase.co/auth/v1/callback`

4. Click "Create"

### 1.5 Get Your Credentials
After creation, you'll get:
- **Client ID**: `your-client-id.apps.googleusercontent.com`
- **Client Secret**: `your-client-secret`

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to your Supabase Dashboard
2. Navigate to "Authentication" → "Providers"
3. Find "Google" and toggle it ON

### 2.2 Configure Google Settings
Fill in the following fields:

- **Client ID**: `your-client-id.apps.googleusercontent.com`
- **Client Secret**: `your-client-secret`
- **Skip nonce checks**: Leave unchecked (more secure)
- **Callback URL**: `https://ubtayveusmjsfmsekhkg.supabase.co/auth/v1/callback` (already provided)

### 2.3 Additional Settings
- **Enable email confirmations**: Recommended for production
- **Enable email change confirmations**: Recommended for production

## Step 3: Update Your Application

### 3.1 Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 3.2 Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ubtayveusmjsfmsekhkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3.3 Supabase Client Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3.4 Google Sign-In Implementation
```typescript
// components/GoogleSignIn.tsx
import { supabase } from '@/lib/supabase'

export const GoogleSignIn = () => {
  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  return (
    <button 
      onClick={handleGoogleSignIn}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Sign in with Google
    </button>
  )
}
```

### 3.5 Auth Callback Handler
```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to your app
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
```

## Step 4: Database Integration

### 4.1 Update User Profiles
The Google OAuth will create users in Supabase's `auth.users` table. You'll need to sync this with your custom tables:

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into customers table if it's a customer signup
  INSERT INTO customers (id, name, email, phone, district, province)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'district', ''),
    COALESCE(NEW.raw_user_meta_data->>'province', '')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create customer profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4.2 Update RLS Policies
```sql
-- Update RLS policies to work with Supabase Auth
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Customers can update own data" ON customers;

CREATE POLICY "Users can view own customer data" ON customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own customer data" ON customers
  FOR UPDATE USING (auth.uid() = id);

-- Similar updates for other tables...
```

## Step 5: Testing

### 5.1 Test Google Sign-In
1. Start your development server
2. Navigate to your sign-in page
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify user is created in Supabase

### 5.2 Verify Database Integration
1. Check that user appears in `auth.users`
2. Verify customer profile is created in `customers` table
3. Test that RLS policies work correctly

## Troubleshooting

### Common Issues:
1. **"Invalid redirect URI"**: Ensure callback URL is exactly as configured
2. **"Client ID not found"**: Double-check Client ID in Supabase settings
3. **"Access blocked"**: Check OAuth consent screen configuration
4. **Database sync issues**: Verify trigger function is working

### Debug Steps:
1. Check browser console for errors
2. Verify Supabase logs in dashboard
3. Test with different browsers/incognito mode
4. Check Google Cloud Console for API quotas

## Security Considerations

1. **Never expose Client Secret** in frontend code
2. **Use HTTPS** in production
3. **Validate redirect URLs** carefully
4. **Enable email confirmations** for production
5. **Regularly rotate secrets**

## Production Checklist

- [ ] Google Cloud project configured
- [ ] OAuth credentials created
- [ ] Supabase Google provider enabled
- [ ] Environment variables set
- [ ] Database triggers working
- [ ] RLS policies updated
- [ ] HTTPS enabled
- [ ] Domain added to authorized origins
- [ ] Email confirmations enabled
- [ ] Error handling implemented
