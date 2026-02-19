import { Suspense } from 'react';
import SignupForm from './SignupForm';

export const metadata = {
  title: 'Partner Registration | CashTree',
  description: 'Join the CashTree Network. Create your promoter account and start earning instantly with instant UPI payouts.',
};

export default function PromoterPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#030305', color: '#00ff88',
        fontFamily: "'SF Mono','Menlo','Courier New',monospace",
        fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase'
      }}>
        Initializing Secure Gateway...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}