// One-off script: crawl dabira.org and capture desktop + mobile screenshots.
// Not part of the app build — run manually with `node scripts/screenshot-site.mjs`.
import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://dabira.org";
const OUT_DIR = path.resolve("ui-screenshots");
const MAX_PAGES = 25;

fs.mkdirSync(OUT_DIR, { recursive: true });

function slugify(pathname) {
  if (pathname === "/" || pathname === "") return "home";
  return pathname.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

async function discoverLinks(page) {
  const hrefs = await page.$$eval("a[href]", (as) =>
    as.map((a) => a.getAttribute("href")).filter(Boolean)
  );
  const urls = new Set();
  for (const href of hrefs) {
    try {
      const u = new URL(href, BASE);
      if (u.hostname !== new URL(BASE).hostname) continue;
      if (/\.(pdf|jpg|jpeg|png|svg|zip|docx?|xlsx?)$/i.test(u.pathname)) continue;
      u.hash = "";
      urls.add(u.origin + u.pathname);
    } catch {}
  }
  return urls;
}

async function main() {
  const browser = await chromium.launch();

  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobileCtx = await browser.newContext({ ...devices["iPhone 13"] });

  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto(BASE, { waitUntil: "networkidle", timeout: 45000 });

  const toVisit = new Set([BASE + "/"]);
  const found = await discoverLinks(desktopPage);
  for (const f of found) toVisit.add(f);

  const visited = new Set();
  const results = [];

  for (const url of toVisit) {
    if (visited.size >= MAX_PAGES) break;
    if (visited.has(url)) continue;
    visited.add(url);

    const slug = slugify(new URL(url).pathname);
    console.log(`Capturing: ${url} -> ${slug}`);

    try {
      await desktopPage.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await desktopPage.waitForTimeout(1200);
      await desktopPage.screenshot({
        path: path.join(OUT_DIR, `${slug}-desktop.png`),
        fullPage: true,
      });

      // Discover more links from this page too
      const more = await discoverLinks(desktopPage);
      for (const m of more) {
        if (!visited.has(m)) toVisit.add(m);
      }

      const mobilePage = await mobileCtx.newPage();
      await mobilePage.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await mobilePage.waitForTimeout(1200);
      await mobilePage.screenshot({
        path: path.join(OUT_DIR, `${slug}-mobile.png`),
        fullPage: true,
      });
      await mobilePage.close();

      results.push({ url, slug, ok: true });
    } catch (err) {
      console.error(`Failed: ${url} - ${err.message}`);
      results.push({ url, slug, ok: false, error: err.message });
    }
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "_manifest.json"),
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  console.log(`Done. ${results.filter((r) => r.ok).length}/${results.length} pages captured.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
