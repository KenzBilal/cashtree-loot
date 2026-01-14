// COPY REFERRAL CODE
document.getElementById("copyBtn").addEventListener("click", () => {
  const code = document.getElementById("refCode").innerText;
  navigator.clipboard.writeText(code);

  const btn = document.getElementById("copyBtn");
  btn.textContent = "Copied ✓";
  btn.classList.add("copied");

  setTimeout(() => {
    btn.textContent = "Copy";
    btn.classList.remove("copied");
  }, 2000);
});

// SUBMIT & REDIRECT
document.getElementById("submitBtn").addEventListener("click", () => {
  const phone = document.getElementById("phone").value.trim();

  if (phone.length < 8) {
    alert("Please enter a valid phone number");
    return;
  }

  // OFFICIAL QONEQT REFERRAL LINK
  window.location.href = "https://qon.is/join?key=8424042254214049";
});
