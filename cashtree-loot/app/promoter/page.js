import { Suspense } from 'react';
import SignupForm from './SignupForm';

export const metadata = {
  title: 'Promoter Registration',
  description: 'Secure Gateway for Partners',
};

export default function PromoterPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        color: '#00ff88', fontFamily: 'monospace', background: '#000'
      }}>
        LOADING SECURE GATEWAY...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}