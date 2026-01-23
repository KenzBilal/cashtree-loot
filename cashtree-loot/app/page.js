export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#000',
      color: '#fff',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        CashTree
      </h1>

      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
        Earn with verified referrals
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/login"
           style={{
             padding: '12px 24px',
             background: '#22c55e',
             color: '#000',
             fontWeight: 'bold',
             borderRadius: '8px',
             textDecoration: 'none'
           }}>
          Dashboard / Login
        </a>

        <a href="/promoter"
           style={{
             padding: '12px 24px',
             border: '1px solid #22c55e',
             color: '#22c55e',
             borderRadius: '8px',
             textDecoration: 'none'
           }}>
          Become a Promoter
        </a>
      </div>
    </main>
  );
}
