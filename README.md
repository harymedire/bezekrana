# BezEkrana

SaaS platforma za roditelje djece 2–4 godine. Sedmični paketi aktivnosti (PDF) sa per-user drip pristupom — svaki novi pretplatnik kreće od paketa #1 bez obzira kada se pridruži.

## Stack

- **Next.js 15** (App Router, RSC, TypeScript)
- **Supabase** — Postgres + Auth + Storage + RLS
- **Stripe** — Payment Element (inline, bez redirect-a) za pretplatu i jednokratne kupovine
- **Dodo Payments** — paralelna integracija (scaffold)
- **Tailwind CSS** + custom paleta (koral / sun / teal / plum)
- **next-intl** — bs / sr / hr / en / de + scaffolds za sl / pl
- **Railway** za deploy

---

## Lokalno pokretanje

```bash
npm install
cp .env.example .env.local
# popuni .env.local (vidi sekciju ispod)
npm run dev
```

Aplikacija ide na `http://localhost:3000` → preusmjerava na `http://localhost:3000/bs`.

---

## Supabase setup

1. Kreiraj projekt na supabase.com
2. Iz Project Settings → API kopiraj `URL`, `anon key`, `service_role key` u `.env.local`
3. U SQL editoru pokreni redom migracije iz `supabase/migrations/`:
   - `20260429000001_initial_schema.sql`
   - `20260429000002_rls_policies.sql`
   - `20260429000003_storage.sql`
   - `20260429000004_seed_sos.sql` (opcionalno — seed SOS savjeta)
4. **Bootstrap prvog admina**: registruj se kroz aplikaciju, pa u Supabase Table Editor postavi `profiles.role = 'admin'` na svom redu
5. (Opcionalno) Authentication → Providers → uključi Google OAuth

---

## Stripe setup

1. Kreiraj proizvod **"BezEkrana — Sedmična pretplata"** sa cijenama:
   - BAM 5.99/sedmica (recurring)
   - EUR 2.99/week (recurring)
   - USD $2.99/week (recurring)
   ID-jeve cijena upisuješ u `STRIPE_PRICE_SUB_*`
2. Kreiraj proizvod **"BezEkrana — Jednokratni paket"** sa default cijenama (BAM 9.99 / EUR 4.99 / USD 4.99) i upiši u `STRIPE_PRICE_ONETIME_*`. Admin može override-ati cijenu po paketu — u tom slučaju koristi se `payment_intents.create` sa custom amount-om umjesto fiksne cijene.
3. **Webhook**: u Stripe Dashboard → Developers → Webhooks dodaj endpoint:
   - URL: `https://your-app.railway.app/api/stripe/webhook`
   - Events: `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`
   - Webhook secret → `STRIPE_WEBHOOK_SECRET`
4. Lokalno možeš testirati sa:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

---

## Dodo Payments

Trenutno scaffold (UI + API rute postoje, SDK pozivi su `TODO`). Kad mi pošalješ:
- tačan API endpoint za "create subscription with embedded payment"
- tačan API endpoint za "create one-time payment intent"
- shemu webhook potpisa

zamijenit ću `src/lib/dodo/server.ts` real-deal pozivima. Ostatak aplikacije neće trebati izmjene jer su rute (`/api/dodo/*`) već identične Stripe-ovim po obliku.

---

## Drip-pristup logika (kako radi)

1. Korisnik se pretplati. Stripe webhook `invoice.payment_succeeded` (sa `billing_reason = subscription_create`) postavlja:
   - `subscription_started_at = NOW()`
   - `weeks_consumed = 1`
   → korisnik vidi paket #1.
2. Svake naredne sedmice Stripe naplaćuje, šalje novi `invoice.payment_succeeded` webhook, koji inkrementira `weeks_consumed += 1` → otključava sljedeći paket.
3. Ako korisnik **otkaže ili pauzira**, `weeks_consumed` se NE smanjuje. Kada se vrati, sljedeća uspješna naplata samo nastavlja brojač — niko ne plaća dvaput za isti sadržaj.
4. **Jednokratne kupovine** zaobilaze brojač: red u `one_time_purchases` daje pristup samo tom konkretnom paketu, bez obzira na `weeks_consumed`.

SQL helper `user_can_access_pack(uuid)` je single source of truth — koristi ga i RLS i API ruta `/api/content/download/[id]`.

---

## Struktura

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              ← landing
│   │   ├── pricing/              ← cijene + dinamički listing one-time paketa
│   │   ├── login, register/      ← auth
│   │   ├── checkout/             ← inline Stripe + Dodo Payment Element
│   │   ├── onboarding/           ← post-register CTA na pricing
│   │   ├── dashboard/            ← korisnički panel (current/archive/sos/settings)
│   │   └── admin/                ← admin (packs CRUD + users)
│   └── api/
│       ├── auth/callback         ← OAuth + email confirm callback
│       ├── stripe/{create-subscription,create-onetime,webhook,billing-portal}
│       ├── dodo/{create-subscription,create-onetime,webhook}
│       ├── content/download/[id] ← signed-URL gateway
│       ├── tracking/persist      ← UTM → DB poslije registracije
│       └── admin/packs           ← upload PDF + CRUD
├── components/{auth, checkout, admin, landing, layout, ui}
├── lib/{i18n, stripe, dodo, supabase, utils}
├── messages/{bs,sr,hr,en,de}.json
└── types/db.ts
supabase/migrations/                 ← 4 SQL migracije
middleware.ts                        ← i18n routing + UTM capture + Supabase session refresh
```

---

## Deployment na Railway

1. `git init && git add . && git commit -m "init"` i push na GitHub repo
2. U Railway → New Project → Deploy from GitHub repo
3. Settings → Variables — paste sve iz `.env.example` sa pravim vrijednostima
4. Settings → Networking → Generate domain (ili custom)
5. Build pokreće `npm ci && npm run build`, start pokreće `npm run start` (vidi `railway.json`)
6. Webhook URL-ove (`https://<your-domain>/api/stripe/webhook` i `/api/dodo/webhook`) dodaj u dashboard providera

---

## Šta još treba

- [ ] Email notifikacije (Resend/Postmark) za "novi paket je otključan" → samo dodati `app/api/notify/route.ts` i pozivati iz webhook-a
- [ ] Real Dodo SDK pozivi (čekam tvoj input)
- [ ] Prevod sl/pl JSON-ova kada izađemo na ta tržišta
- [ ] Testovi (vitest + playwright e2e za checkout flow)
- [ ] OG slike + favicon set
