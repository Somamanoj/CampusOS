import { createFreebuffNext } from "@freebuff/auth/next";
import "./globals.css";

export const { handlers, getUser, proxy } = createFreebuffNext({
  clientId: process.env.FREEBUFF_CLIENT_ID || "f0ab8f11-603c-4829-9a10-cb92cab488a4",
  issuer: process.env.FREEBUFF_ISSUER || "https://freebuff.com/oidc",
  baseUrl: process.env.APP_ORIGIN || "https://pv-12761141be80-769eff8a-c3c0-4710-a94a-d8a18e17d182.style.dev",
  allowInsecureLocalhost: true,  
});

export const metadata = {
  title: "Campus Event Manager",
  description: "Organize, discover, and manage campus events",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
