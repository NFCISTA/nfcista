import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^([^=\s]+)\s*=\s*(.*)/);
  if (m) envVars[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
}

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const anonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

const db = createClient(supabaseUrl, anonKey);

async function check() {
  console.log("Checking admin_users table with anon client:");
  const { data: adminUsers, error: auErr } = await db.from("admin_users").select("*");
  console.log("admin_users query:", { data: adminUsers, error: auErr?.message });
}
check();
