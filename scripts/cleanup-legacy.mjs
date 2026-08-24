import { rm, readdir } from "node:fs/promises";
import path from "node:path";

// Clean stale files left by previous GitHub uploads before Next.js scans the repo.
const stalePaths = [
  "app/page.tsx", "app/page.js", "app/layout.tsx", "app/layout.js",
  "app/agence", "app/auth/callback", "app/dashboard", "app/initialisation",
  "app/login", "app/portail", "app/prospects", "app/reset-password",
  "app/api/expenses", "app/api/instituts", "app/api/leads", "app/api/users",
  "app/api/auth/profile", "app/api/auth/reset-password", "app/api/initialize",
  "app/api/setup", "app/api/webhook", "components/PrestyApp.tsx",
  "components/PrestyApp.jsx", "lib/handlers",
  // Current GHR source is JavaScript. Old TypeScript config makes Next try to
  // run TypeScript validation and fail when old repo files remain.
  "tsconfig.json", "next-env.d.ts"
];

for (const rel of stalePaths) {
  await rm(path.join(process.cwd(), rel), { recursive: true, force: true });
}

// The current release contains no TS/TSX source. Remove any stale TS/TSX files
// left anywhere in app/components/lib by previous deployments.
async function removeStaleTypeScript(dir) {
  let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await removeStaleTypeScript(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) await rm(full, { force: true });
  }
}
for (const rel of ["app", "components", "lib"]) {
  await removeStaleTypeScript(path.join(process.cwd(), rel));
}

console.log("[build] Legacy files and stale TypeScript artifacts removed.");
