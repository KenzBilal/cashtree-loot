import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreateForm from './CreateForm';

export const metadata = {
  title: 'Deploy New Mission | Admin',
};

export default function CreateCampaignPage() {
  return (
    <div style={{animation: 'fadeIn 0.6s ease-out'}}>
      
      {/* 1. MISSION HEADER */}
      <div style={{marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px'}}>
        <Link href="/admin/campaigns" style={{
          width: '44px', height: '44px', borderRadius: '12px', background: '#1a1a1a', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          border: '1px solid #333', transition: 'all 0.2s'
        }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
            Deploy <span style={{color: '#666'}}>Mission</span>
          </h1>
          <p style={{color: '#888', fontSize: '12px', marginTop: '4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'}}>
             CONFIGURE NEW OFFER PARAMETERS
          </p>
        </div>
      </div>

      {/* 2. RENDER THE INTERACTIVE FORM */}
      <CreateForm />
      
    </div>
  );
}