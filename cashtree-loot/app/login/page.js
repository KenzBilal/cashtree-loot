export const metadata = {
  title: 'Partner Access | CashTree'
};

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#04060a',
        color: '#eaf2f8',
        fontFamily: 'Inter, system-ui'
      }}
    >
      <div
        className="login-box"
        dangerouslySetInnerHTML={{
          __html: `
            <div class="security-badge">
              <i class="fas fa-shield-halved"></i> Secure Partner Access
            </div>

            <div class="brand">Cash<span>Tree</span></div>
            <div class="desc">Login for verified promoters only</div>

            <form id="loginForm" autocomplete="off">
              <div class="field">
                <label>Partner Code</label>
                <input id="username" type="text" />
              </div>

              <div class="field">
                <label>Access Key</label>
                <input id="password" type="password" />
              </div>

              <button class="login-btn" type="submit">
                UNLOCK DASHBOARD
              </button>
            </form>

            <div class="helper">
              Forgot access key? <b>Contact admin</b>
            </div>

            <div class="footer">
              New here? <a href="/promoter">Become a promoter →</a>
            </div>
          `
        }}
      />

      {/* UI logic */}
      <script src="/login-ui.js"></script>
    </main>
  );
}
