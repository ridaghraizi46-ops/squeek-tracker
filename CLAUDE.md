# Project: squeek-tracker

## Purpose

Read-only web dashboard of Squeekchain mining progress (Sepolia testnet). Built as project #2 for the Squeekchain Genesis "Buildooooor" badge.

## Current focus

Built and tested locally against the live network. Not yet published to GitHub or submitted.

## Notes

- Files: `site/index.html`, `site/app.js` (all logic), `README.md`. No dependencies, no build step.
- Contract addresses come from the API (`/v1/economy/state` -> `identities`), not hard-coded. Squeekchain redeployed (release `stream-game-sepolia-test-20261026-01`) and the docs' old addresses (SQK `0x6872...`, mining `0x3beE...`) are stale.
- On Sepolia the mining contract pays 5,600 SQK per block (not the 6,900 launch value).
- The sibling project `../squeek-viewer` still uses the old addresses and may show stale data.
- Squeekchain submission form fields: project name, public GitHub repo, demo URL (optional), how it uses Squeekchain.
