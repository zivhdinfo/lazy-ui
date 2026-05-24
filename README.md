# Lazy-ui

Copy-and-paste Tailwind components. Monochrome, motion-forward, shadcn-compatible.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- motion (animations) · three / @react-three/fiber (3D)
- shadcn registry served from `/r/[name].json`

## Routes

| Path                    | What                          |
| ----------------------- | ----------------------------- |
| `/`                     | Landing                       |
| `/components`           | Component gallery             |
| `/components/[slug]`    | Component detail + customize  |
| `/blocks`               | Block gallery (full sections) |
| `/blocks/[slug]`        | Block detail + customize      |
| `/docs`, `/docs/[slug]` | Docs                          |
| `/r/[name].json`        | shadcn registry endpoint      |

Public URL is `/r/<slug>.json`. Implementation lives in `src/app/r/[...name]/route.ts` because App Router won't bind dynamic params on a `[name].json` segment.

## Develop

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Install a component via shadcn

Local:

```bash
npx shadcn@latest add http://localhost:3000/r/button-magic.json
```

Production:

```bash
npx shadcn@latest add https://2lazyui.com/r/button-magic.json
```

## Adding a component

See [CLAUDE.md](./CLAUDE.md) for the file-by-file checklist. Design tokens and motion rules are in [DESIGN.md](./DESIGN.md).

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run the built app
- `npm run lint` — eslint
