// Every theme must load cleanly, keep its decorations clear of the nav, and respect reduced motion.
const { test, expect } = require('@playwright/test');

// Read the theme list from the page itself so new themes are covered automatically
async function themeIds(page) {
    await page.goto('/index.html?theme=none');
    return page.evaluate(() => window.MVThemes.themes.map(t => t.id));
}

test('plain site has no theme applied', async ({ page }) => {
    await page.goto('/index.html?theme=none');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});

test('date preview picks the dated theme', async ({ page }) => {
    await page.goto('/index.html?date=2026-10-28');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'halloween');
});

test('every theme loads without errors and stays clear of the nav', async ({ page }) => {
    for (const id of await themeIds(page)) {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(`/index.html?theme=${id}`);
        await expect(page.locator('html'), id).toHaveAttribute('data-theme', id);

        const ornament = page.locator('.theme-ornament');
        if (await ornament.count()) {
            const nav = await page.locator('.modern-nav').boundingBox();
            const lights = page.locator('.theme-lights');
            const navBottom = (await lights.count())
                ? (await lights.boundingBox()).y + (await lights.boundingBox()).height
                : nav.y + nav.height;
            const box = await ornament.boundingBox();
            expect(box.y, `${id}: ornament tucked under the nav`).toBeGreaterThanOrEqual(navBottom);
            expect(box.x + box.width, `${id}: ornament off-screen`).toBeLessThanOrEqual(page.viewportSize().width);
        }
        expect(errors, `${id}: page errors`).toEqual([]);
        page.removeAllListeners('pageerror');
    }
});

test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('no ambient animation layers or toggle', async ({ page }) => {
        for (const id of await themeIds(page)) {
            await page.goto(`/index.html?theme=${id}`);
            await expect(page.locator('.theme-layer'), id).toHaveCount(0);
            await expect(page.locator('.theme-toggle'), id).toHaveCount(0);
        }
    });
});

// Visual review captures: npm run shots → test-results/shots/
test('@shots hero of every theme', async ({ page }, info) => {
    for (const id of ['none', ...await themeIds(page)]) {
        await page.goto(`/index.html?theme=${id}`);
        await page.waitForTimeout(3500);
        await page.screenshot({ path: `test-results/shots/${info.project.name}-${id}.png` });
    }
});
