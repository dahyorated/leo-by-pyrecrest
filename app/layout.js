import './globals.css';

export const metadata = {
  title: 'Leo by Pyrecrest — Shortlet Apartment in Somolu, Lagos',
  description: 'A stylish 1-bedroom apartment in the heart of Somolu, Lagos — perfect for short stays, business trips, and getaways. Book online with instant confirmation.',
  openGraph: {
    title: 'Leo by Pyrecrest — Shortlet Apartment in Somolu, Lagos',
    description: 'A stylish 1-bedroom apartment in Somolu, Lagos. Fast WiFi, 24/7 power, AC, full kitchen. Book online.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://checkout.flutterwave.com/v3.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
