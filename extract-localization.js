// extract-localization.js
const fs = require('fs');
const path = require('path');

const results = [];

/**
 * Strip off the asset‐meta header and parse only the scene/prefab content.
 */
function parseContent(rawText) {
  // Cocos Creator .scene/.prefab files have a JSON meta‐block,
  // then a newline and the actual data object.
  const splitAt = rawText.indexOf('\n{');
  const jsonText = splitAt > 0
    ? rawText.slice(splitAt + 1)
    : rawText;
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.warn(`⚠️ Failed to parse JSON content: ${err.message}`);
    return null;
  }
}

/**
 * Recursively traverse an object tree and collect Label / RichText strings.
 */
function traverse(node, filePath, trail = []) {
  if (node && typeof node === 'object') {
    const type = node.__type__;
    if ((type === 'cc.Label' || type === 'cc.RichText')) {
      // The text property may appear under different keys
      const text = node.string || node._string || node['_N$string'] || '';
      if (text) {
        results.push({
          type: type === 'cc.Label' ? 'Label' : 'RichText',
          text,
          path: `${filePath} > ${trail.join('/')}`,
        });
      }
    }
    // Continue recursion
    for (const key in node) {
      traverse(node[key], filePath, [...trail, key]);
    }
  } else if (Array.isArray(node)) {
    node.forEach((child, i) =>
      traverse(child, filePath, [...trail, `[${i}]`])
    );
  }
}

/**
 * Walk the assets directory and process all .scene, .prefab and .fire files.
 */
function scanDirectory(dir) {
  fs.readdirSync(dir).forEach(name => {
    const fullPath = path.join(dir, name);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (/\.(scene|prefab|fire)$/.test(name)) {
      const rawText = fs.readFileSync(fullPath, 'utf8');
      const data = parseContent(rawText);
      if (data) traverse(data, fullPath);
    }
  });
}

// ——— Main Entry Point ———
const projectRoot = process.cwd();
const assetsFolder = path.join(projectRoot, 'assets');

if (!fs.existsSync(assetsFolder)) {
  console.error('❌ "assets" folder not found. Run this script from the project root.');
  process.exit(1);
}

// Scan and collect
scanDirectory(assetsFolder);

// Prepare output folder
const outFolder = path.join(projectRoot, 'localization');
if (!fs.existsSync(outFolder)) fs.mkdirSync(outFolder);

// Write JSON
fs.writeFileSync(
  path.join(outFolder, 'texts.json'),
  JSON.stringify(results, null, 2),
  'utf8'
);

// Write CSV
const csvLines = ['type,text,path'];
results.forEach(({ type, text, path: p }) => {
  const escape = s => `"${s.replace(/"/g, '""')}"`;
  csvLines.push([escape(type), escape(text), escape(p)].join(','));
});
fs.writeFileSync(path.join(outFolder, 'texts.csv'), csvLines.join('\n'), 'utf8');

console.log(`✅ Extracted ${results.length} entries → localization/texts.json and texts.csv`);
