<!DOCTYPE html>
<html lang="en">
<head>
  <!-- =========================
       CORE META
  ========================== -->
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="robots" content="noindex, nofollow" />

  <title>Partner Access | CashTree</title>

  <!-- =========================
       FONTS & ICONS
  ========================== -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <!-- =========================
       THEME (CASH TREE)
  ========================== -->
  <style>
    :root {
      --bg-1: #04060a;
      --bg-2: #07101a;
      --card: rgba(255, 255, 255, 0.04);
      --border: rgba(255, 255, 255, 0.08);
      --text: #eaf2f8;
      --muted: #90a0b0;
      --green: #22c55e;
      --green-glow: rgba(34, 197, 94, 0.35);
      --danger: #ef4444;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: 'Inter', sans-serif;
      color: var(--text);
      background:
        radial-gradient(1200px 600px at 12% 12%, rgba(36, 54, 60, 0.15), transparent 60%),
        linear-gradient(180deg, var(--bg-1), var(--bg-2) 85%);
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .login-box {
      width: 100%;
      max-width: 400px;
      padding: 40px 32px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 22px;
      backdrop-filter: blur(14px);
      box-shadow: 0 15px 40px rgba(0,0,0,0.45);
      text-align: center;
    }

    .security-badge {
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 800;
      color: var(--green);
      margin-bottom: 18px;
    }

    .brand {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    .brand span { color: var(--green); }

    .desc {
      font-size: 14px;
      color: var(--muted);
      margin-bottom: 32px;
    }

    .field {
      text-align: left;
      margin-bottom: 18px;
    }

    .field label {
      font-size: 11px;
      font-weight: 700;
      color: var(--muted);
      margin-bottom: 8px;
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }

    .field input {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: rgba(0,0,0,0.35);
      color: white;
      outline: none;
      font-size: 14px;
      transition: 0.2s;
    }

    .field input:focus {
      border-color: var(--green);
      background: rgba(0,0,0,0.55);
    }

    .login-btn {
      width: 100%;
      margin-top: 10px;
      padding: 16px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(180deg, var(--green), #16a34a);
      color: #022c22;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 1px;
      cursor: pointer;
      box-shadow: 0 6px 20px var(--green-glow);
      transition: transform 0.15s;
    }

    .login-btn:active { transform: scale(0.97); }

    .helper {
      margin-top: 18px;
      font-size: 12px;
      color: var(--muted);
    }

    .helper a {
      color: var(--green);
      text-decoration: none;
      font-weight: 700;
    }

    .footer {
      margin-top: 30px;
      padding-top: 18px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--muted);
    }

    .footer a {
      color: var(--green);
      font-weight: 800;
      text-decoration: none;
    }
  </style>
</head>

<body>

  <div class="login-box">

    <div class="security-badge">
      <i class="fas fa-shield-halved"></i> Secure Partner Access
    </div>

    <div class="brand">Cash<span>Tree</span></div>
    <div class="desc">Login for verified promoters only</div>

    <!-- LOGIN FORM (UI ONLY) -->
    <form id="loginForm" autocomplete="off">
      <div class="field">
        <label for="username">Partner Code</label>
        <input id="username" type="text" placeholder="Your username" required />
      </div>

      <div class="field">
        <label for="password">Access Key</label>
        <input id="password" type="password" placeholder="••••••••" required />
      </div>

      <button class="login-btn" type="submit">
        UNLOCK DASHBOARD
      </button>
    </form>

    <!-- NO SELF PASSWORD RESET -->
    <div class="helper">
      Forgot access key? <b>Contact admin</b>
    </div>

    <!-- PROMOTER ONBOARDING -->
    <div class="footer">
      New here? <a href="/promoter">Become a promoter →</a>
    </div>

  </div>

  <!-- UI LOGIC (NO AUTHORITY) -->
  <script src="/login-ui.js"></script>

</body>
</html>
