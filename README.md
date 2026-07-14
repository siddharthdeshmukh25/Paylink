# NexForge PayPages

React + Vite frontend with Firebase Authentication, MongoDB data storage, Cloudinary uploads, and Netlify Functions.

## Local setup

1. Copy `.env.example` to `.env` and complete every value.
2. Run `npm install`.
3. Run `npm run dev` for UI-only development, or `npx netlify dev` to use the API functions locally.

## Netlify environment variables

Add these in **Netlify → Site configuration → Environment variables**. Do not commit them or use `VITE_` for server secrets.

| Browser build variables | Netlify Functions only |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `MONGODB_URI` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `CLOUDINARY_URL` |
| `VITE_FIREBASE_PROJECT_ID` | `FIREBASE_ADMIN_PROJECT_ID` |
| `VITE_FIREBASE_APP_ID` | `FIREBASE_ADMIN_CLIENT_EMAIL` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `FIREBASE_ADMIN_PRIVATE_KEY` |

For Firebase Admin, create a service account key in Firebase/Google Cloud and place its `project_id`, `client_email`, and private key in the three `FIREBASE_ADMIN_*` variables. Preserve the private-key newlines; Netlify also accepts `\n` escaped values.

## Important implementation notes

- Firebase is only used for authentication. Page/user data goes to MongoDB.
- Cloudinary uploads happen through a protected Netlify Function; the `CLOUDINARY_URL` never reaches the React bundle.
- Payments use a direct UPI URI, not Razorpay: `upi://pay?pa=...&pn=...&am=...&tn=...`.
- A QR can open a UPI app directly, but a real scan cannot be detected by a webpage. `qrScans` needs a dedicated tracked redirect/landing URL (or UPI provider webhooks) if exact scan measurement is required.
