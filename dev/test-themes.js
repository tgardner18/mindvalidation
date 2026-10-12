// Theme sanity checks: date windows resolve correctly and every palette passes the readability rules.
// Run: node dev/test-themes.js
global.window = {};
global.document = { currentScript: { hasAttribute: () => true } };
require(require('path').join(__dirname, '..', 'js', 'themes.js'));
const { resolve } = window.MVThemes;
const cases = {
  '2026-08-31': null, '2026-09-01': 'fall', '2026-10-26': 'fall', '2026-10-27': 'halloween',
  '2026-11-01': 'halloween', '2026-11-02': 'fall', '2026-11-30': 'fall', '2026-12-01': 'winter', '2026-12-11': 'winter', '2026-12-12': 'holidays', '2026-12-27': 'holidays', '2026-12-28': 'winter', '2026-12-29': 'winter', '2026-12-30': 'newyear', '2027-01-01': 'newyear', '2027-01-02': 'newyear', '2027-01-03': 'winter',
  '2027-01-15': 'winter',
  '2027-02-10': 'winter', '2027-02-11': 'valentines', '2027-02-15': 'valentines', '2027-02-16': 'winter',
  '2027-03-13': null, '2027-03-14': 'stpatricks', '2027-03-18': 'stpatricks', '2027-03-19': null,
  '2027-04-30': null, '2027-05-01': 'mhmonth', '2027-05-07': 'mhmonth', '2027-05-08': 'mothersday', '2027-05-09': 'mothersday', '2027-05-10': 'mhmonth', '2027-05-31': 'mhmonth', '2027-06-01': null,
  '2027-06-18': null, '2027-06-19': 'fathersday', '2027-06-20': 'fathersday', '2027-06-21': null,
  '2027-06-30': null, '2027-07-01': 'july4', '2027-07-05': 'july4', '2027-07-06': null,
  '2026-10-07': 'fall', '2026-10-08': 'wmhd', '2026-10-11': 'wmhd', '2026-10-12': 'fall',
  '2026-11-22': 'fall', '2026-11-23': 'thanksgiving', '2026-11-27': 'thanksgiving', '2026-11-28': 'fall',
  '2027-11-22': 'thanksgiving', '2027-11-26': 'thanksgiving', '2027-02-28': 'winter', '2028-02-29': 'winter', '2027-03-01': null, '2026-06-15': null
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
