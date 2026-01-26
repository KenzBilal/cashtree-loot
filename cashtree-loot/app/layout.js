import "./globals.css"; 

export const metadata = {
  title: "CashTree",
  description: "Secure Partner Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}