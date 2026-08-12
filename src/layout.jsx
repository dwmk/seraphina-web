import "./globals.css";

export const metadata = {
  title: "HuanMux",
  description: "Reach the greatest heights. Cloud-native applications and games for all.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
