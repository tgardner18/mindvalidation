// Theme sanity checks: date windows resolve correctly and every palette passes the readability rules.
// Run: node dev/test-themes.js
global.window = {};
global.document = { currentScript: { hasAttribute: () => true } };
require(require('path').join(__dirname, '..', 'js', 'themes.js'));
const { resolve } = window.MVThemes;
const cases = {
  '2026-08-31': null, '2026-09-01': 'fall', '2026-10-26': 'fall', '2026-10-27': 'halloween',
  '2026-11-01': 'halloween', '2026-11-02': 'fall', '2026-11-30': 'fall', '2026-12-01': 'winter', '2026-12-17': 'winter', '2026-12-18': 'holidays', '2026-12-26': 'holidays', '2026-12-27': 'winter',
  '2027-01-15': 'winter', '2027-02-28': 'winter', '2028-02-29': 'winter', '2027-03-01': null, '2026-06-15': null
};
let fail = 0;
for (const [d, want] of Object.entries(cases)) {
  const [y, m, dd] = d.split('-').map(Number);
  const got = (resolve(new Date(y, m - 1, dd)) || {}).id || null;
  const ok = got === want; if (!ok) fail++;
  console.log((ok ? 'ok  ' : 'FAIL') + ' ' + d + ' -> ' + got + (ok ? '' : ' (want ' + want + ')'));
}
if (fail) process.exitCode = 1;

// Every palette must pass the readability rules
const { themes, checkContrast } = window.MVThemes;
for (const t of themes.filter(t => t.palette)) {
  const failed = checkContrast(t.palette).filter(r => !r.pass);
  console.log((failed.length ? 'FAIL' : 'ok  ') + ' contrast ' + t.id + (failed.length ? ': ' + failed.map(r => r.label + ' ' + r.ratio).join(', ') : ''));
  if (failed.length) process.exitCode = 1;
}
