/**
 * Poll Vercel deployment status for the latest deployment.
 * Uses Vercel API with token from env or CLI arg.
 *
 * Usage: node scripts/check-vercel-deploy.mjs [VERCEL_TOKEN]
 */
import fs from "fs";

const token = process.argv[2] || (() => {
  try {
    const env = fs.readFileSync(".env.local", "utf-8");
    for (const line of env.split("\n")) {
      const m = line.match(/^VERCEL_TOKEN\s*=\s*(.*)/);
      if (m) return m[1].replace(/^["']|["']$/g, "").trim();
    }
  } catch {}
  return null;
})();

const PROJECT_NAME = "nfc-card";
const TEAM_SLUG = null; // set if using a team

async function getLatestDeployment() {
  const url = `https://api.vercel.com/v6/deployments?app=${PROJECT_NAME}&limit=3`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    console.log(`Vercel API: HTTP ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data.deployments?.[0] || null;
}

if (!token) {
  console.log("No VERCEL_TOKEN found. Checking deployment via production URL instead.");
  console.log("Polling https://nfcista.vercel.app to detect new deployment...");

  let attempts = 0;
  while (attempts < 10) {
    attempts++;
    try {
      const res = await fetch("https://nfcista.vercel.app/dashboard/profile", {
        redirect: "manual",
      });
      console.log(`  Attempt ${attempts}: HTTP ${res.status} (${new Date().toISOString()})`);
      if (res.status === 200 || res.status === 307) {
        console.log("  Production site responsive.");
        break;
      }
    } catch (e) {
      console.log(`  Attempt ${attempts}: Network error — ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 10000));
  }
} else {
  const deployment = await getLatestDeployment();
  if (deployment) {
    console.log("Latest deployment:", JSON.stringify({
      uid: deployment.uid,
      url: deployment.url,
      state: deployment.state,
      target: deployment.target,
      meta: deployment.meta,
    }, null, 2));
  } else {
    console.log("No deployments found via API.");
  }
}
