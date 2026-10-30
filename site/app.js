// squeek-tracker: read-only dashboard for Squeekchain mining progress (Sepolia testnet).
// Runs in the browser. It only reads public data: no wallet connection, no signing, no keys.

export const CHAIN_ID = 11155111;
export const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const API_BASE_URL = "https://api.squeekchain.com";

// Function selectors (first 4 bytes of the keccak hash of the signature).
const SEL = {
  totalSupply: "0x18160ddd", // totalSupply()
  symbol: "0x95d89b41", // symbol()
  supplyCap: "0x0cfccc83", // SUPPLY_CAP()
};

const isAddress = (s) => /^0x[0-9a-fA-F]{40}$/.test(s);

async function rpc(method, params) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

const call = (to, data) => rpc("eth_call", [{ to, data }, "latest"]);

async function api(path) {
  const res = await fetch(new URL(path, API_BASE_URL), { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`API ${path} returned HTTP ${res.status}`);
  const body = await res.json();
  // The API answers 200 with status "unavailable" when it does not know: treat that as unknown, not zero.
  if (body.status === "unavailable") throw new Error(`API ${path} unavailable: ${body.reason ?? "no reason given"}`);
  return body;
}

function decodeString(hex) {
  const bytes = hex.slice(2);
  const len = Number(BigInt("0x" + bytes.slice(64, 128)));
  const data = bytes.slice(128, 128 + len * 2);
  return decodeURIComponent(data.replace(/../g, "%$&"));
}

// 18-decimal base units -> whole SQK, with thousands separators, no decimals.
export function formatSqk(baseUnits) {
  const whole = (BigInt(baseUnits) / 10n ** 18n).toString();
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export async function load() {
  if ((await rpc("eth_chainId", [])) !== "0x" + CHAIN_ID.toString(16)) throw new Error("RPC is not Sepolia");

  const [status, economy] = await Promise.all([api("/v1/status"), api("/v1/economy/state")]);

  // Contract addresses come from the API's own deployment identities, so the page follows redeployments.
  const tokenAddr = economy.identities?.token;
  const miningAddr = economy.identities?.mining?.proxy;
  if (!isAddress(tokenAddr) || !isAddress(miningAddr)) throw new Error("API did not return contract addresses");

  // Check the on-chain contracts really are what the API says before showing any number.
  const symbol = decodeString(await call(tokenAddr, SEL.symbol));
  if (symbol !== "SQK") throw new Error(`Token at ${tokenAddr} reports symbol "${symbol}", expected SQK. Stopping.`);

  const [supplyHex, capHex] = await Promise.all([call(tokenAddr, SEL.totalSupply), call(miningAddr, SEL.supplyCap)]);
  const onChainSupply = BigInt(supplyHex);
  const onChainCap = BigInt(capHex);

  const anchor = status.builder?.anchor;
  const projected = status.builder?.projected;
  return {
    tokenAddr,
    miningAddr,
    wheel: status.measurement?.freshness,
    coreStatus: status.measurement?.coreStatus,
    currentRound: economy.lifecycle?.currentRound,
    settledRound: anchor?.settledThroughRound,
    settledBlocks: anchor?.blockHeight,
    projectedBlocks: projected?.blockHeight,
    progressPct: anchor ? Number(BigInt(anchor.blockProgress) * 10000n / 1000000000n) / 100 : null,
    workPerThousandBlocks: anchor?.workPerThousandBlocks,
    onChainSupply,
    onChainCap,
    supplyPct: Number((onChainSupply * 1000000n) / onChainCap) / 10000,
    apiMinted: economy.supply?.totalMintedBaseUnits,
  };
}

if (typeof document !== "undefined") {
  const out = document.getElementById("result");
  const refresh = document.getElementById("refresh");
  const run = async () => {
    out.className = "";
    out.textContent = "Loading…";
    try {
      const r = await load();
      const rows = [
        ["Wheel", `${r.wheel ?? "unknown"} (core: ${r.coreStatus ?? "unknown"})`],
        ["Round", `${r.currentRound} (settled through ${r.settledRound})`],
        ["Squeek blocks (settled)", `${r.settledBlocks}`],
        ["Squeek blocks (projected)", `${r.projectedBlocks} (optimistic, not yet settled)`],
        ["Progress to next block", `${r.progressPct}%`],
        ["Difficulty", `${r.workPerThousandBlocks} work per 1,000 blocks`],
        ["SQK minted (on-chain)", `${formatSqk(r.onChainSupply)} of ${formatSqk(r.onChainCap)} (${r.supplyPct}%)`],
        ["SQK minted (API index)", r.apiMinted ? formatSqk(r.apiMinted) : "unknown"],
        ["SQK token", r.tokenAddr],
        ["Mining contract", r.miningAddr],
      ];
      out.textContent = "";
      const dl = document.createElement("dl");
      for (const [k, v] of rows) {
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = k;
        dd.textContent = v;
        dl.append(dt, dd);
      }
      out.append(dl);
    } catch (err) {
      out.textContent = `Could not load: ${err.message}`;
      out.className = "error";
    }
  };
  refresh.addEventListener("click", run);
  run();
}
