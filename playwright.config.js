// Browser tests for the seasonal/holiday theme system. Run: npm test (first time: npx playwright install chromium)
const { defineConfig, devices } = require('@playwright/test');

const PORT = 8010;

module.exports = defineConfig({
    testDir: 'tests',
    reporter: 'list',
    // Screenshot captures only run via `npm run shots`
    grepInvert: process.env.SHOTS ? undefined : /@shots/,
    use: { baseURL: `http://localhost:${PORT}` },
    webServer: {
        command: `python3 -m http.server ${PORT}`,
        url: `http://localhost:${PORT}/index.html`,
        reuseExistingServer: true,
        stdout: 'ignore',
        stderr: 'ignore'
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
        { name: 'phone', use: { ...devices['Pixel 7'] } }
    ]
});
