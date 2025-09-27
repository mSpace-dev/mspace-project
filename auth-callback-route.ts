import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const userType = requestUrl.searchParams.get('user_type') || 'customer';
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/dashboard';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        // Update user metadata with user type
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            user_type: userType,
            ...data.user.user_metadata
          }
        });

        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        }

        // Redirect to the specified page
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`);
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=An unexpected error occurred`);
    }
  }

  // If no code, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`);
}

// Handle POST requests (if needed)
export async function POST(request: NextRequest) {
  return GET(request);
}
