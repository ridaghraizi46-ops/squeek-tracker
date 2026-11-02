# Project: squeek-tracker

## Purpose

Read-only web dashboard of Squeekchain mining progress (Sepolia testnet). Built as project #2 for the Squeekchain Genesis "Buildooooor" badge.

## Current focus

Published on GitHub (github.com/ridaghraizi46-ops/squeek-tracker, commit e61a888) and checked against the live network on 2026-11-02 (round 1020, ~27.09M SQK minted): works as is. Whether it was submitted on the Squeekchain Genesis page is unknown (that area needs Rida's login); Rida to confirm.

## Notes

- Files: `site/index.html`, `site/app.js` (all logic), `README.md`. No dependencies, no build step.
- Contract addresses come from the API (`/v1/economy/state` -> `identities`), not hard-coded. Squeekchain redeployed (release `stream-game-sepolia-test-20261026-01`) and the docs' old addresses (SQK `0x6872...`, mining `0x3beE...`) are stale.
- On Sepolia the mining contract pays 5,600 SQK per block (not the 6,900 launch value).
- The sibling project `../squeek-viewer` was fixed on 2026-11-02: it now reads the live deployment and the new `/v1/accounts/{address}` API.
- Squeekchain submission form fields: project name, public GitHub repo, demo URL (optional), how it uses Squeekchain.
