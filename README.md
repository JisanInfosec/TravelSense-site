# TravelSense Web (Next.js)

See the [root README](../README.md) for setup, test accounts and architecture.

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Pages

| Route | Description |
|---|---|
| `/` | Home: hero search, popular destinations, categories, lesser-known places, safety section |
| `/destinations` | Explore: keyword search + category filter + sort + hidden-gem toggle (state kept in the URL) |
| `/destinations/[slug]` | Details: gallery, info, safety, hospitals/police, emergency contacts, map, Google Maps navigation, links, reviews, nearby |
| `/login`, `/register` | Authentication (supports `?next=` redirect) |
| `/dashboard/*` | Tourist dashboard: overview, favourites, wishlist, my reviews, edit profile |
| `/admin/*` | Staff console: overview, destinations (admin), reviews (moderator + admin), users (admin), reports (admin), profile |
| `/about` | About and data-transparency notes |

## Structure

```
src/app/            routes (App Router; Cache Components enabled)
src/components/ui/  design-system primitives (buttons, forms, badges, dialogs, states, stars, toast)
src/components/*    layout, destination, dashboard, admin and auth components
src/lib/            API client, auth context, shared types, utilities
```

Design tokens (the brand palette from the brief) are defined in `src/app/globals.css`.
