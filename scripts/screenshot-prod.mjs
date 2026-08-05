import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://dabira-dabira.vercel.app/", { waitUntil: "networkidle" });
await page.screenshot({ path: "ui-screenshots/prod-home.png", fullPage: true });
console.log("done, title:", await page.title());
await browser.close();
