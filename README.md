# squeek-tracker

A small read-only web page that shows how [Squeekchain](https://docs.squeekchain.com) mining is going.
Squeekchain is a hamster-powered proof-of-work toychain; this page runs against its **Sepolia testnet**
deployment and shows:

- whether the wheel is online, and the current round
- Squeek blocks completed (settled, and projected-but-not-yet-settled)
- progress toward the next block, and the current difficulty (work per 1,000 blocks)
- SQK minted so far against the 2.1 billion cap

It never asks for a wallet, a signature or a private key, and it never sends a transaction.

## How it uses Squeekchain

- Reads the `SQK` token (`symbol`, `totalSupply`) and the `SqueekMining` contract (`SUPPLY_CAP`) on Sepolia directly over RPC.
- Takes the contract addresses from Squeekchain's public API deployment identities, so it follows redeployments instead of hard-coding addresses.
- Checks that the token on-chain really reports the symbol `SQK` before showing any number, and stops if not.
- Uses the public API (`/v1/status`, `/v1/economy/state`) for the wheel status, round, block count and difficulty.
- Shows the on-chain SQK supply next to the API's own figure, so a mismatch is visible.

## Run it

It is a static page with no dependencies. Serve the `site` folder with any static server, for example:

```
cd site
python -m http.server 8000
```

then open http://localhost:8000.

## Notes

- SQK on Sepolia is a test token with no real value.
- Blocks labelled "projected" are optimistic and not yet settled on-chain.
- The API answers HTTP 200 with `"status": "unavailable"` when it does not know something; the page treats that as unknown, not zero.
