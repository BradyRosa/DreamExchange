# DreamExchange

DreamExchange is a Base mini app for recording, editing, fusing and clearing onchain dream records.

## Stack

- Next.js App Router
- TypeScript
- Wagmi
- Viem
- Base mainnet

## Attribution Placeholders

Base offchain attribution is hardcoded in `app/layout.tsx`:

```html
<meta name="base:app_id" content="" />
```

Base onchain attribution is prepared in `lib/wagmi.ts`:

```ts
export const baseDataSuffix = "0x" as `0x${string}`;
```

After base.dev verification, replace both placeholders and redeploy.
