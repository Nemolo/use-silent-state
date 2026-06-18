import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const bump = process.argv[2] ?? 'patch';
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error(`Invalid bump type: ${bump}. Use patch | minor | major`);
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

// 1. bump version in package.json only (no commit, no tag)
run(`pnpm version ${bump} --no-git-tag-version`);

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

// 2. generate/update CHANGELOG.md using the new version
run('pnpm auto-changelog -p');

// 3. commit all release artifacts
run('git add package.json pnpm-lock.yaml CHANGELOG.md');
run(`git commit -m "chore: release v${version}"`);

// 4. tag and push (triggers the publish workflow)
// annotated tag required: git push --follow-tags ignores lightweight tags
run(`git tag -a v${version} -m "v${version}"`);
run('git push --follow-tags');
