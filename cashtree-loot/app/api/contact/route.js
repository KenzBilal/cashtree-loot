import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, category, message } = body;

    // 1. Validation (Stop empty spams)
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 2. Insert into Supabase
    // We explicitly map the frontend fields to the database columns
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert([
        {
          name,
          email,
          phone: phone || '',   // Handle optional fields
          company: company || '',
          category,
          message,
          status: 'unread'      // Default status
        }
      ]);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}