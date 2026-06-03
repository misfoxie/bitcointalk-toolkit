// build.js — Bundle the content script for the extension.
// Run with: node build.js
// Or for watch mode: node build.js --watch

import * as esbuild from 'esbuild';
import { existsSync } from 'fs';
import { resolve } from 'path';

const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['./src/content/content.js'],
  bundle: true,
  outfile: 'src/content/content-bundle.js',
  format: 'iife',
  platform: 'browser',
  target: 'chrome111',
  sourcemap: false,
  minify: false,
  logLevel: 'info',
});

if (watch) {
  await ctx.watch();
  console.log('Watching for changes… (Ctrl+C to stop)');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Build complete: src/content/content-bundle.js');
}
