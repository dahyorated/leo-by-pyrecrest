# Leo by Pyrecrest — Shortlet Apartment Landing Page

## Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
1. Create a new repo on GitHub (e.g. `leo-by-pyrecrest`)
2. Upload all files from this folder to the repo

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your `leo-by-pyrecrest` repo
4. Click **Deploy** — that's it!

Vercel will give you a URL like `leo-by-pyrecrest.vercel.app`. You can add a custom domain later in Vercel settings.

## Configuration

All settings are in `app/page.jsx` at the top in the `CONFIG` object:

| Setting | What to change |
|---------|---------------|
| `flutterwaveKey` | Your Flutterwave public key |
| `ownerEmail` | Email for booking notifications |
| `whatsapp` | Your WhatsApp number with country code |
| `nightlyRate` | Price per night in Naira |
| `cleaningFee` | One-time cleaning fee |
| `cautionDeposit` | Refundable caution deposit |
| `maxGuests` | Maximum number of guests |

## EmailJS (email notifications)

Already configured with:
- Service ID: `service_sm0402u`
- Template ID: `template_bpowk6x`
- Public Key: `spaPwEbKkXXRcHgvN`

## Flutterwave (payments)

1. Sign up at [flutterwave.com](https://flutterwave.com)
2. Get your **public key** from Dashboard → Settings → API
3. Replace `FLWPUBK-xxxxxxxxxxxxxxxxxxxxx-X` in `CONFIG.flutterwaveKey`

The Flutterwave inline script is loaded in `app/layout.js`.

## Images

Replace the Unsplash placeholder URLs in the `IMAGES` array with your actual apartment photos. You can either:
- Host images on your own domain in the `/public` folder
- Use a service like Cloudinary or Imgur
- Keep using Unsplash URLs (not recommended for production)

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Flutterwave Inline (payments)
- EmailJS (email notifications)
- Deployed on Vercel
