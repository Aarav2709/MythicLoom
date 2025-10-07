#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env if present so developers can configure their test subreddit locally.
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is an optional dev dependency; ignore if it's missing.
}

const resolveManifest = () => {
  const manifestPath = path.resolve(process.cwd(), 'devvit.json');
  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return manifest;
  } catch (error) {
    console.warn('[mythicloom] Unable to parse devvit.json, continuing without manifest defaults.');
    return undefined;
  }
};

const getSlug = (manifest) => {
  if (!manifest) {
    return undefined;
  }

  const fromManifest = manifest.slug || manifest.name;
  return typeof fromManifest === 'string' && fromManifest.trim() ? fromManifest.trim() : undefined;
};

const getConfiguredSubreddit = () => {
  const fromEnv =
    process.env.MYTHICLOOM_PLAYTEST_SUBREDDIT || process.env.DEVVIT_PLAYTEST_SUBREDDIT;
  if (fromEnv) {
    return fromEnv;
  }

  const manifest = resolveManifest();
  const fromManifest =
    manifest?.playtestSubreddit || manifest?.playtest?.subreddit || manifest?.metadata?.playtestSubreddit;

  return fromManifest;
};

const normalizeSubreddit = (maybeSubreddit) => {
  if (!maybeSubreddit) {
    return undefined;
  }

  const trimmed = maybeSubreddit.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/^r\//i, '');
};

const ensureValidSubreddit = (subreddit) => {
  const pattern = /^[A-Za-z0-9][A-Za-z0-9_]{1,20}$/;
  if (!pattern.test(subreddit)) {
    console.error(
      `[mythicloom] "${subreddit}" is not a valid subreddit name. Set MYTHICLOOM_PLAYTEST_SUBREDDIT (without the r/ prefix).`
    );
    process.exit(1);
  }
};

const manifest = resolveManifest();
const slug = getSlug(manifest) ?? 'mythicloom';

const subreddit = normalizeSubreddit(getConfiguredSubreddit());
if (!subreddit) {
  console.error(
    '[mythicloom] Missing playtest subreddit. Set MYTHICLOOM_PLAYTEST_SUBREDDIT in your environment or add "playtestSubreddit" to devvit.json.'
  );
  process.exit(1);
}

ensureValidSubreddit(subreddit);
console.log(`[mythicloom] Using playtest subreddit r/${subreddit}`);
console.log(
  `[mythicloom] Once the CLI finishes uploading, open https://www.reddit.com/r/${subreddit}/?playtest=${slug} (new Reddit) and use the Apps panel to launch MythicLoom.`
);

const runCommand = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

runCommand('npm', ['run', 'build']);
runCommand('npx', ['devvit', 'playtest', subreddit]);
