supabase.auth.getSession().then(({ data }) => {
  if (data.session?.user?.app_metadata?.role === "admin") {
    document.body.classList.add("admin-unlocked");
  }
});

const supabaseUrl = "https://qzjvratinjirrcmgzjlx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6anZyYXRpbmppcnJjbWd6amx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAxMDksImV4cCI6MjA4MzgwNjEwOX0.W01Pmbokf20stTgkUsmI3TZahXYK4PPbU0v_2Ziy9YA";

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

async function handleLogin() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    alert("Invalid credentials");
    return;
  }

  const role = data.user.app_metadata?.role;

  if (role !== "admin") {
    await supabase.auth.signOut();
    alert("Unauthorized account");
    return;
  }

  // SUCCESS
  document.getElementById("loginModal").classList.add("hidden");
  initDashboard();

  document.body.classList.add("admin-unlocked");

}
