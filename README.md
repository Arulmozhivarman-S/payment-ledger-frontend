# Ledger Console

LIVE URL    =    https://payment-ledger-frontend.onrender.com/

A monochrome React frontend for the double-entry payment ledger backend. It
covers the full API surface: register / sign in (JWT), open accounts, read
balances, post idempotent transfers, and replay a transfer by its idempotency
key. Amounts are handled as integer minor units throughout, and every transfer
renders as a paired debit / credit posting.

Stack: React 18 + Vite. No UI framework — one stylesheet, system fonts plus
three Google fonts.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. By default the dev server proxies `/login`,
`/register`, `/accounts`, and `/transfers` to `http://localhost:8080`, so the
browser treats backend calls as same-origin and CORS never applies. Start your
Spring Boot app first. If the backend runs elsewhere:

```bash
BACKEND_URL=http://localhost:9000 npm run dev
```

The **API base** field in the top bar overrides the target at runtime. Leave it
empty to use the proxy / same-origin; set it to a full origin (e.g.
`http://localhost:8080`) to call a backend directly.

## Build & host

```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the production build locally
```

`dist/` is plain static files — host it anywhere (Netlify, Vercel, GitHub
Pages, S3, nginx). Two ways to point it at the backend:

1. **Same origin (no CORS).** Copy the contents of `dist/` into the backend's
   `src/main/resources/static/`. Spring Boot then serves the UI at
   `http://localhost:8080/` and all relative API calls stay same-origin. Leave
   `VITE_API_BASE` unset.
2. **Separate host.** Set `VITE_API_BASE` to the backend origin before building,
   and enable CORS on the backend for the frontend's origin.

## Backend notes

- **Auth routes.** This UI calls `/login` and `/register` to match the
  controller mappings. The security chain currently permits `/auth/**`, so
  unless those two routes are public they will reject calls before a token
  exists. Either move the controller under `@RequestMapping("/auth")` or permit
  the exact paths: `.requestMatchers("/login", "/register").permitAll()`.
- **CORS** is only needed when the frontend is hosted on a different origin than
  the backend. Same-origin hosting (option 1 above) or the dev proxy avoids it
  entirely.
- **Token storage.** The JWT is kept in `localStorage` and decoded locally for
  display. It is only ever sent back to your own API as a bearer header.

## Layout

```
src/
  App.jsx              state, fetch client, view switching
  util.js              money formatting, JWT decode, key generation
  index.css            monochrome design system
  components/
    TopBar.jsx         API base + session status
    Access.jsx         register / login / token
    Accounts.jsx       open account / read balance
    Transfer.jsx       post a transfer
    Activity.jsx       fetch a transfer by key
    Posting.jsx        debit / credit mirror
    Banner.jsx         inline feedback
```
