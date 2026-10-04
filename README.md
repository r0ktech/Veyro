# Veyro: Laptops, Phones & Accessories

An online tech store built with **Next.js 16**, **Supabase** (Postgres database + auth), **Google sign-in** (OAuth client from Google Cloud Console) and **Mailgun** (order confirmation emails).

**Categories:** MacBooks · Windows Laptops · iPhones · Android Phones · Monitors · Keyboards · Mice · Headphones · Chargers · SSDs (40 seeded products).

## Features

| Requirement | Where it lives |
|---|---|
| Shop website | `/` home, `/shop` (category filter, search, sort), `/products/[slug]` detail pages |
| Checkout page | `/cart` → `/checkout` (shipping form + payment choice) → `/orders/[id]` confirmation |
| Persist everything in Supabase | Products, categories, user profiles, **carts**, orders and order items are all Postgres tables (`supabase/schema.sql`) with Row Level Security |
| Confirmation emails via Mailgun | Sent when an order is placed (`src/lib/mailgun.ts`, template in `src/lib/emails.ts`), plus a "Resend" button on the order page |
| Google auth via Google Cloud Console | "Continue with Google" on `/login`, using Supabase Auth's Google provider with your own OAuth client |

How checkout works: the `place_order()` Postgres function reads the signed-in user's cart **from the database**, takes prices from the `products` table (never from the browser), locks and decrements stock, creates the order and its items, and clears the cart, all in one transaction. The server action then sends the Mailgun email.

Guests can browse and add to a cart (kept in the browser). When they sign in, it is merged into their saved cart in Supabase. Checkout, account and orders require sign-in.

> Payment is "Pay on delivery" or "Bank transfer". No card details are collected, so no payment processor is needed.

---

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase (database)

1. Create a project at <https://supabase.com/dashboard>.
2. Go to **SQL Editor → New query**. Paste in and run [`supabase/schema.sql`](supabase/schema.sql), then do the same for [`supabase/seed.sql`](supabase/seed.sql).
   - Already ran an older `seed.sql`? Run these once each, in any order:
     - [`supabase/update-product-photos.sql`](supabase/update-product-photos.sql) if products show drawings instead of photos
     - [`supabase/switch-to-naira.sql`](supabase/switch-to-naira.sql) if prices show in dollars
3. Go to **Project Settings → API** and copy the **Project URL** and the **publishable key** (older projects: anon key) into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   ```

### 3. Google sign-in (Google Cloud Console)

1. Open <https://console.cloud.google.com/> and create (or pick) a project.
2. Go to **APIs & Services → OAuth consent screen** (also called "Google Auth Platform → Branding"). Set the app name (Veyro), support email and developer email. Choose the **External** audience, and while testing add your team's Gmail addresses as **test users**.
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins:** `http://localhost:3000` (and your deployed URL later)
   - **Authorized redirect URIs:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
     (Supabase shows this exact URL on its Google provider page.)
4. Copy the **Client ID** and **Client secret**.
5. In Supabase, go to **Authentication → Sign In / Providers → Google**. Enable it and paste in the Client ID and secret.
6. In Supabase, go to **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (change to your production URL when you deploy)
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` (and `https://your-domain/auth/callback`)

### 4. Mailgun (emails)

1. Sign up at <https://www.mailgun.com/>. A free account includes a **sandbox domain** (`sandboxXXXX.mailgun.org`).
2. **Sandbox domains can only send to "authorized recipients".** Add the Gmail address(es) you'll test with under **Sending → Domains → (sandbox) → Authorized recipients**, then click the confirmation link Mailgun emails you. To send to anyone, add and verify your own domain instead.
3. Create an API key (**Account → API Keys**) and fill in `.env.local`:
   ```
   MAILGUN_API_KEY=...
   MAILGUN_DOMAIN=sandboxXXXX.mailgun.org
   MAILGUN_FROM="Veyro <postmaster@sandboxXXXX.mailgun.org>"
   MAILGUN_API_URL=https://api.mailgun.net      # use https://api.eu.mailgun.net for EU domains
   ```

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>, add a few products, sign in with Google and place an order. You'll land on the confirmation page and the email arrives at your Google address.

---

## Deploying (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add every variable from `.env.local` in **Project → Settings → Environment Variables**, and set `NEXT_PUBLIC_SITE_URL` to the live URL.
3. Add the live URL to the Google OAuth client's **Authorized JavaScript origins**, and add `https://your-domain/auth/callback` to Supabase **Redirect URLs** (and update its Site URL).

## Project structure

```
supabase/
  schema.sql          tables, RLS policies, place_order() + mark_order_emailed() functions
  seed.sql            10 categories, 40 products
  update-product-photos.sql  one-off: adds photos to a database seeded before they existed
  switch-to-naira.sql        one-off: converts a dollar-priced database to naira
src/
  proxy.ts            refreshes the Supabase session; guards /checkout, /account, /orders
  app/
    page.tsx          home
    shop/             catalogue with filter / search / sort
    products/[slug]/  product detail
    cart/             cart
    checkout/         checkout form + server actions (place order, send email)
    orders/[id]/      order confirmation / details
    account/          profile + order history
    login/            Google sign-in
    auth/callback/    OAuth code → session
    auth/signout/     sign out
  components/         Header, Footer, ProductCard, ProductVisual, CartProvider, …
  lib/
    supabase/         browser, server and proxy clients
    mailgun.ts        Mailgun HTTP API sender
    emails.ts         order confirmation email (HTML + text)
    pricing.ts        currency, shipping & tax constants (mirrored in place_order())
```

## Customising

- **Products:** edit rows in Supabase **Table Editor → products**.
- **Photos:** product photos are in `public/images/products/<slug>.jpg`, from Wikimedia Commons under Creative Commons / public-domain licences. The `/credits` page credits each one; keep it if you replace photos. To use your own, drop a file in `public/images/products/` (or use any image URL) and set the product's `image_url`. Products with no `image_url` fall back to a generated drawing.
- **Currency:** prices are in naira (₦). Amounts are stored in kobo, so `149900000` in a `price_cents` column means ₦1,499,000. Shipping is ₦5,000, free over ₦500,000, plus 7.5% VAT.
- **Shipping fee, free-shipping threshold, tax rate:** change both `src/lib/pricing.ts` and the constants at the top of `place_order()` in `schema.sql`, then re-run that function in the SQL editor.
- **Order status:** change `orders.status` in the Table Editor (`confirmed` → `shipped` → `delivered`). It shows up on the customer's account page.
