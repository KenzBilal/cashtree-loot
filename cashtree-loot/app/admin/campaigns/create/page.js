import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreateForm from './CreateForm';

export const metadata = {
  title: 'Deploy New Mission | Admin',
};

export default function CreateCampaignPage() {
  return (
    <div style={{animation: 'fadeIn 0.6s ease-out'}}>
      
      {/* HEADER */}
      <div style={{marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px'}}>
        <Link href="/admin/campaigns" style={{
          width: '40px', height: '40px', borderRadius: '12px', background: '#1a1a1a', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
        }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{fontSize: '32px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px'}}>
            Deploy <span style={{color: '#666'}}>Mission</span>
          </h1>
          <p style={{color: '#888', fontSize: '13px', marginTop: '4px', fontWeight: '600'}}>
             CONFIGURE NEW OFFER PARAMETERS
          </p>
        </div>
      </div>

      {/* RENDER FORM */}
      <CreateForm />
      
    </div>
  );
}