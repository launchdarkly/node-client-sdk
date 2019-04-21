
let version = process.env.VERSION;
if (!version) {
  const package = require('../package.json');
  version = package.version;
}

module.exports = {
  out: './build/html',
  name: 'LaunchDarkly Client-Side Node SDK (' + version + ')',
  readme: 'none',                // don't add a home page with a copy of README.md
  mode: 'file',                  // don't treat "typings.d.ts" itself as a parent module
  includeDeclarations: true,     // allows it to process a .d.ts file instead of actual TS code
  entryPoint: '"launchdarkly-node-client-sdk"'    // note extra quotes - workaround for a TypeDoc bug
};
