const fs = require('node:fs');
const path = require('node:path');

function configureMapbox({ directory, token = '', revision }) {
  token = token.trim();
  if (!/^pk\.[A-Za-z0-9._-]+$/.test(token)) {
    throw new Error('Set the MAPBOX_PUBLIC_TOKEN Actions secret to a public Mapbox token (pk.).');
  }
  if (!revision || !/^[A-Za-z0-9_-]+$/.test(revision)) {
    throw new Error('A deployment revision is required for the Mapbox configuration.');
  }

  // A rerun can update the secret without changing the commit. Version by run
  // and attempt so browsers never reuse the previous deployment's empty config.
  const source = `mapbox-config.js?v=${revision}`;
  const pages = fs.readdirSync(directory).filter(file => file.endsWith('.html')).flatMap(file => {
    const location = path.join(directory, file);
    const before = fs.readFileSync(location, 'utf8');
    const after = before.replace(/(<script\b[^>]*\bsrc=["'])mapbox-config\.js(?:\?[^"']*)?(["'])/g, `$1${source}$2`);
    return before === after ? [] : [{ location, after }];
  });
  if (!pages.length) throw new Error('No HTML entry points reference the Mapbox configuration.');

  fs.writeFileSync(path.join(directory, 'mapbox-config.js'), 'window.NOODO_MAPBOX = ' + JSON.stringify({
    accessToken: token,
    style: 'mapbox://styles/mapbox/dark-v11',
  }) + ';\n');
  for (const page of pages) fs.writeFileSync(page.location, page.after);
  return pages.length;
}

if (require.main === module) {
  try {
    const { MAPBOX_PUBLIC_TOKEN, GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT } = process.env;
    if (!GITHUB_RUN_ID || !GITHUB_RUN_ATTEMPT) throw new Error('Run this deployment step in GitHub Actions.');
    const count = configureMapbox({
      directory: path.join(__dirname, '../dist'),
      token: MAPBOX_PUBLIC_TOKEN,
      revision: `${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}`,
    });
    console.log(`Updated Mapbox configuration references in ${count} HTML entry points.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { configureMapbox };
