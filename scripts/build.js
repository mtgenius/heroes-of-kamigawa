const VERSION = 1;

const { readdirSync, unlinkSync,  writeFileSync } = require('node:fs');
const { join } = require('node:path');
const BOK = require('../mtgjson/bok.json');
const CHK = require('../mtgjson/chk.json');
const NEO = require('../mtgjson/neo.json');
const SOK = require('../mtgjson/sok.json');
const mapSet = require('./utils/map-set.js');

for (const file of readdirSync('dist')) {
  unlinkSync(join('dist', file));
}

writeFileSync(`./dist/${VERSION}.json`, JSON.stringify({
  bok: mapSet(BOK),
  chk: mapSet(CHK),
  neo: mapSet(NEO),
  sok: mapSet(SOK),
}));
