import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../../assets/screenshots');
const base = process.env.APP_URL || 'http://localhost:3000';
const api = process.env.API_URL || 'http://localhost:5000/api';

fs.mkdirSync(outDir, { recursive: true });

const shot = async (page, name) => {
  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: false,
  });
  console.log('saved', name);
};

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await shot(page, '01-landing');

    await page.goto(`${base}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await shot(page, '02-register-choice');

    await page.goto(`${base}/register/company`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await shot(page, '03-register-company');

    await page.goto(`${base}/register/join`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await shot(page, '04-register-join');

    await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await shot(page, '05-login');

    const loginResponse = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@novaforge-labs.demo',
        password: 'Demo@12345!',
      }),
    });
    const loginJson = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
    }

    const data = loginJson.data;
    const token = data.accessToken || data.token;
    const refreshToken = data.refreshToken || '';
    const user = data.user;

    await context.addInitScript(
      ({ token, refreshToken, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem(
          'erp_auth',
          JSON.stringify({ user, token, refreshToken })
        );
      },
      { token, refreshToken, user }
    );

    await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Logout' }).waitFor({ timeout: 20000 });
    await page.waitForTimeout(800);
    await shot(page, '06-dashboard');

    const clickNav = async (label) => {
      await page.getByRole('link', { name: label, exact: true }).first().click();
      await page.waitForTimeout(1200);
    };

    await clickNav('Employees');
    await shot(page, '07-employees');

    await clickNav('Attendance');
    await shot(page, '08-attendance');

    await clickNav('Leave');
    await shot(page, '09-leave');

    await clickNav('Payroll');
    await shot(page, '10-payroll');

    await clickNav('Inventory');
    await shot(page, '11-inventory');

    await clickNav('Messages');
    await shot(page, '12-messages');

    await clickNav('Peer Reviews');
    await shot(page, '13-peer-reviews');

    await clickNav('Announcements');
    await shot(page, '14-announcements');

    await clickNav('Company Settings');
    await shot(page, '15-company-settings');

    await clickNav('Manage Users');
    await shot(page, '16-admin-users');

    console.log('All screenshots captured.');
  } finally {
    await browser.close();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
