const attempts = new Map();

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const record = attempts.get(ip) || { count: 0, start: now };
  
  if (now - record.start > windowMs) {
    attempts.set(ip, { count: 1, start: now });
  } else if (record.count >= maxAttempts) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  } else {
    attempts.set(ip, { ...record, count: record.count + 1 });
  }
  // ... proceed with login
}