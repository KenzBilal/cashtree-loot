"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    // Try to sign up first
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      // If they already exist, try logging in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) alert(signInError.message)
      else router.push('/') // Go back home on success
    } else {
      alert('Check your email for the confirmation link!')
    }
  }

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h1>Login to Earn</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="Enter Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Enter Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#48bb78', color: 'white', border: 'none', cursor: 'pointer' }}>
          Start Earning
        </button>
      </form>
    </div>
  )
}