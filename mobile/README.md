# Veyro mobile app

React Native (Expo) app for the Veyro store. It talks to the **same backend as the website**:

| What | How |
|---|---|
| Accounts | Same Supabase project and the same Google sign-in, so one account works on both |
| Products, cart, orders | Same Supabase tables and row level security as the website |
| Live cart sync | Supabase Realtime on `cart_items`: an item added on the website appears in the app instantly, and vice versa |
| Checkout | `POST /api/checkout` on the website (same order logic and confirmation email as the website's checkout) |
| Product photos | Served by the website (`/images/products/…`) |

Screens: Shop (search + categories), product details, Cart (live), Checkout, order confirmation, Account (Google sign-in, order history, sign out).

## One-time setup

1. **Turn on live cart sync.** In Supabase → SQL Editor, run [`../supabase/enable-cart-realtime.sql`](../supabase/enable-cart-realtime.sql).
2. **Allow the app's sign-in redirect.** In Supabase → Authentication → URL Configuration → **Redirect URLs**, add:
   - `exp://**` (the app running in Expo Go)
   - `veyro://**` (an installed build of the app)

   Nothing changes in Google Cloud Console: Google still redirects to Supabase.
3. **Config.** Copy `.env.example` to `.env.local` and fill in the same Supabase URL and publishable key as the website. Set `EXPO_PUBLIC_API_URL` to the website:
   - your Vercel URL, e.g. `https://veyro.vercel.app` (it must include the latest code, which has `/api/checkout`), or
   - the website running on your computer: `http://<computer's Wi-Fi IP>:3000`. Find the IP with `ipconfig getifaddr en0` on a Mac.
4. `npm install`

## Run it on your phone

1. Install **Expo Go** from the App Store or Google Play.
2. Put the phone on the **same Wi-Fi** as your computer.
3. If `EXPO_PUBLIC_API_URL` points at your computer, start the website first (`npm run dev` in the project root).
4. In this folder, run `npx expo start`, then scan the QR code (iPhone: Camera app; Android: inside Expo Go).

If the phone can't connect (e.g. on university Wi-Fi), run `npx expo start --tunnel` instead.

## Test login + cart sync

1. **App:** Account tab → **Continue with Google** → choose the same Google account you use on the website. You should see your name and past orders.
2. **Website** (on your computer): sign in with that same Google account.
3. **Website:** add a product to the cart. Within a second the **Cart** tab badge in the app updates and the item appears in the app's cart, with no refresh needed.
4. **App:** change the quantity or remove the item. The website's cart icon updates too.
5. Optional: check out in the app. The order shows up under **Your orders** on the website, and the confirmation email arrives.

## Troubleshooting

- **After Google sign-in you land on the website instead of back in the app:** `exp://**` is missing from Supabase Redirect URLs (setup step 2).
- **Cart doesn't update until you reopen the app:** run `enable-cart-realtime.sql` (setup step 1).
- **No product photos / checkout says it "couldn't reach the Veyro website":** `EXPO_PUBLIC_API_URL` is wrong, or the website isn't running. Restart `npx expo start` after editing `.env.local`.
- **"Project is incompatible with this version of Expo Go":** update Expo Go on the phone.
