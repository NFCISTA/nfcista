const https = require("https");

function check() {
  return new Promise((resolve) => {
    https.get("https://nfcista.vercel.app/p/demo-customer", (res) => {
      resolve({
        status: res.statusCode,
        cacheControl: res.headers["cache-control"],
        cache: res.headers["x-vercel-cache"],
        age: res.headers["age"]
      });
    }).on("error", (e) => resolve({ error: e.message }));
  });
}

async function waitDeployment() {
  console.log("Waiting for Vercel deployment to update...");
  for (let i = 0; i < 30; i++) {
    const res = await check();
    console.log(`Poll ${i+1}: status=${res.status}, cache-control=${res.cacheControl}, x-vercel-cache=${res.cache}, age=${res.age}`);
    if (res.cacheControl && !res.cacheControl.includes("no-cache")) {
      console.log("NEW DEPLOYMENT ACTIVE! Caching header changed to ISR!");
      return;
    }
    await new Promise((r) => setTimeout(r, 6000));
  }
}

waitDeployment();
