# Semantic-Release Versioning Strategies

## Strategy 1: Patch-Lock (Manual Minor/Major Control)
> Use this when YOU decide when to move versions, not commit messages.

**How it works:** Everything is forced to patch. To move to a new minor/major, manually push a tag.

```bash
# Moving to a new minor or major version
git tag v1.2.0 && git push origin v1.2.0  # → next release will be v1.2.1
git tag v2.0.0 && git push origin v2.0.0  # → next release will be v2.0.1
```

### .github/workflows/release.yml
```yaml
name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout (blobless shallow clone)
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          filter: blob:none
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'npm'

      - name: Install semantic-release dependencies
        run: |
          npm install --save-dev \
            semantic-release \
            @semantic-release/commit-analyzer \
            @semantic-release/release-notes-generator \
            @semantic-release/github

      - name: Run semantic-release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### release.config.js
```js
module.exports = {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'angular',
      releaseRules: [
        { breaking: true, release: 'patch' },  // would normally be major
        { type: 'feat',   release: 'patch' },  // would normally be minor
        { type: 'fix',    release: 'patch' },
        { type: 'perf',   release: 'patch' },
        { type: 'revert', release: 'patch' },
        { type: 'docs',   release: 'patch' },
        { type: 'style',  release: 'patch' },
        { type: 'chore',  release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'test',   release: 'patch' },
        { type: 'build',  release: 'patch' },
        { type: 'ci',     release: 'patch' },
      ]
    }],
    '@semantic-release/release-notes-generator',
    ['@semantic-release/github', {
      successComment: false,
    }],
  ]
}
```

### Version flow
```
v1.1.4
  ├── fix: correct nav link        → v1.1.5
  ├── feat: add dark mode          → v1.1.6  (not v1.2.0)
  ├── feat!: redesign homepage     → v1.1.7  (not v2.0.0)
  └── [git tag v1.2.0 manually]
        └── fix: small tweak       → v1.2.1
```

---

## Strategy 2: Automatic (Commit-Driven Minor/Major)
> Use this when you want version bumps to be fully driven by commit message conventions.

**How it works:** Commit type automatically determines the bump. Uses standard
[Conventional Commits](https://www.conventionalcommits.org/) — `fix:` = patch,
`feat:` = minor, `feat!:` or `BREAKING CHANGE:` = major.

### .github/workflows/release.yml
```yaml
name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          filter: blob:none
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'npm'

      - name: Install semantic-release dependencies
        run: |
          npm install --save-dev \
            semantic-release \
            @semantic-release/commit-analyzer \
            @semantic-release/release-notes-generator \
            @semantic-release/github

      - name: Run semantic-release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### release.config.js
```js
module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',         // uses default angular rules
    '@semantic-release/release-notes-generator',
    ['@semantic-release/github', {
      successComment: false,
    }],
  ]
}
```

### Commit message rules
| Commit type          | Example                              | Version bump |
|----------------------|--------------------------------------|--------------|
| `fix:`               | `fix: correct nav link`              | Patch        |
| `perf:`              | `perf: lazy load images`             | Patch        |
| `feat:`              | `feat: add dark mode`                | Minor        |
| `feat!:` or          | `feat!: redesign homepage`           | Major        |
| `BREAKING CHANGE:`   | footer: `BREAKING CHANGE: new API`   | Major        |

### Version flow
```
v1.1.4
  ├── fix: correct nav link        → v1.1.5
  ├── feat: add dark mode          → v1.2.0  (auto minor bump)
  ├── fix: typo                    → v1.2.1
  └── feat!: redesign homepage     → v2.0.0  (auto major bump)
```

---

## Quick Comparison

| | Patch-Lock | Automatic |
|---|---|---|
| Minor/major control | You, via manual tag | Commit message author |
| Risk of accidental bumps | ❌ None | ⚠️ One `feat:` jumps minor |
| Requires commit discipline | ❌ No | ✅ Yes |
| Best for | Static sites, apps, solo/small teams | Libraries, packages, larger teams with PR review |

---

## Notes

### fetch-depth
- `fetch-depth: 0` — full clone, fetches entire git history. Needed if semantic-release has to walk back through multiple previous tags.
- `fetch-depth: 1` — shallow clone, only the latest commit. Fine for patch-lock since semantic-release only needs the latest tag as a baseline, not the full history.
- `filter: blob:none` — blobless clone, skips file content blobs but keeps all commits and tags. Best used alongside `fetch-depth: 0` when full history is needed but you want to keep it fast.

For patch-lock on a static site, `fetch-depth: 1` is sufficient and fastest.

### successComment
Controls whether semantic-release posts a comment on every PR and issue included in a release (e.g. "This was released in v1.1.5").
- `false` — no comments posted. Best for static sites where it's just noise.
- `true` (default, or remove the option entirely) — comments are posted. Useful for libraries/packages where contributors want to know their fix shipped.

Keeping the option commented out (`// successComment: false`) in the config is a good middle ground — defaults to `true` but easy to flip without having to look up the option name.