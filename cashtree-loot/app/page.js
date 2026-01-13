"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [campaigns, setCampaigns] = useState([])
  const [leads, setLeads] = useState([]) // Store the user's history
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function getData() {
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // 2. Get All Active Offers
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
      setCampaigns(campaignsData || [])

      // 3. Get User's Earnings (Leads)
      if (user) {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*, campaigns(title, payout_amount)') // Join tables to get price
          .eq('user_id', user.id)
        
        setLeads(leadsData || [])
      }
    }
    getData()
  }, [])

  // Calculate Total Earnings
  const totalEarnings = leads.reduce((sum, lead) => {
    // Only count if status is 'approved' (optional logic for later)
    return sum + (lead.campaigns?.payout_amount || 0)
  }, 0)

  const handleClaim = async (campaignId, targetUrl) => {
    // 1. Check Login
    if (!user) {
      router.push('/login')
      return
    }

    // 2. Track the Click (Business Logic)
    const { error } = await supabase
      .from('leads')
      .insert([{ campaign_id: campaignId, status: 'pending', user_id: user.id }])

    if (error) {
      alert('Error tracking click')
    } else {
      // 3. THE REDIRECT (Send them to the offer)
      // Open the offer in a new tab
      window.open(targetUrl, '_blank')
      
      // Reload this page to update their wallet balance
      window.location.reload()
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>CashTree Loot 💰</h1>
        {user ? (
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} style={{ padding: '8px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px' }}>
            Logout
          </button>
        ) : (
          <button onClick={() => router.push('/login')} style={{ padding: '8px', background: '#333', color: 'white', border: 'none', borderRadius: '5px' }}>
            Login
          </button>
        )}
      </div>

      {/* --- WALLET CARD (Only shows if logged in) --- */}
      {user && (
        <div style={{ background: '#2d3748', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.8 }}>My Pending Balance</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#48bb78' }}>₹{totalEarnings}</div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem' }}>You have clicked {leads.length} offers.</p>
        </div>
      )}

      {/* --- OFFERS GRID --- */}
      <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Available Loots</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {campaigns.map((offer) => (
          <div key={offer.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', background: 'white' }}>
            <h3 style={{ marginTop: 0 }}>{offer.title}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{offer.description}</p>
            <div style={{ color: '#38a169', fontWeight: 'bold', fontSize: '1.2rem', margin: '10px 0' }}>
              Earn ₹{offer.payout_amount}
            </div>
            <button 
              onClick={() => handleClaim(offer.id, offer.target_url)}
              style={{ width: '100%', padding: '10px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Claim Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}