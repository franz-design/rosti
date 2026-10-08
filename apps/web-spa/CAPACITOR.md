# Rösti mobile (Capacitor)

**On standby.** The current mobile app is the installable PWA. Plan and task list: [PWA and push notifications](../documentation/src/content/docs/guides/pwa-and-push.mdx).

This file is the later native wrapper. Capacitor wraps the SPA build for iOS and Android. Do not add the native projects until the store plan resumes.

## Setup

```bash
pnpm --filter=@rosti/web-spa build
pnpm --filter=@rosti/web-spa exec cap add ios
pnpm --filter=@rosti/web-spa exec cap add android
pnpm --filter=@rosti/web-spa cap:sync
pnpm --filter=@rosti/web-spa cap:ios    # or cap:android
```

Config: [`capacitor.config.json`](./capacitor.config.json)

Deep link scheme: `rosti://invite?token=…&email=…`

Push tokens are registered via `initCapacitorNative()` in `app/lib/capacitor.ts` after login.

Store release plan and task list: [Mobile store release](../documentation/src/content/docs/guides/mobile-store.mdx).
