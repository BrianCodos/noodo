const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { configureMapbox } = require('../scripts/configure-mapbox.cjs');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'noodo-mapbox-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  for (const file of ['listen.html', 'artist.html', 'article.html', 'event.html']) {
    fs.copyFileSync(path.join(__dirname, '../dist', file), path.join(directory, file));
  }
  fs.writeFileSync(path.join(directory, 'unrelated.html'), '<h1>NOODO</h1>');
  fs.writeFileSync(path.join(directory, 'mapbox-config.js'), 'window.NOODO_MAPBOX = {accessToken: ""};');
  return directory;
}

test('deployment configures all map entry points and leaves unrelated markup intact', t => {
  const directory = fixture(t);
  const count = configureMapbox({ directory, token: '  pk.test-fixture\n', revision: '123-1' });
  assert.equal(count, 4);
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(directory, 'mapbox-config.js'), 'utf8'), context);
  assert.equal(context.window.NOODO_MAPBOX.accessToken, 'pk.test-fixture');
  assert.equal(context.window.NOODO_MAPBOX.style, 'mapbox://styles/mapbox/dark-v11');
  for (const file of ['listen.html', 'artist.html', 'article.html', 'event.html']) {
    const original = fs.readFileSync(path.join(__dirname, '../dist', file), 'utf8');
    const deployed = fs.readFileSync(path.join(directory, file), 'utf8');
    assert.equal(deployed, original.replace(/mapbox-config\.js\?[^"']+/g, 'mapbox-config.js?v=123-1'));
  }
  assert.equal(fs.readFileSync(path.join(directory, 'unrelated.html'), 'utf8'), '<h1>NOODO</h1>');
});

test('new runs and reruns invalidate an earlier cached config even at the same commit', t => {
  const directory = fixture(t);
  for (const revision of ['123-1', '123-2', '124-1']) {
    configureMapbox({ directory, token: 'pk.test-fixture', revision });
    const html = fs.readFileSync(path.join(directory, 'listen.html'), 'utf8');
    assert.ok(html.includes(`src="mapbox-config.js?v=${revision}"`));
  }
});

test('missing or non-public tokens fail before modifying the publish directory', t => {
  const directory = fixture(t);
  const before = fs.readdirSync(directory).map(file => [file, fs.readFileSync(path.join(directory, file), 'utf8')]);
  for (const token of ['', '  ', 'sk.test-fixture', 'pk.test fixture']) {
    assert.throws(() => configureMapbox({ directory, token, revision: '123-1' }), /MAPBOX_PUBLIC_TOKEN/);
  }
  for (const [file, content] of before) assert.equal(fs.readFileSync(path.join(directory, file), 'utf8'), content);
});
