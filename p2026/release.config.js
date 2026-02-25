// release.config.js
// Locks all releases to patch bumps only (v1.1.x)
// To move to v1.2.x or v2.x, manually push a new tag (e.g. git tag v1.2.0 && git push origin v1.2.0)
// release.config.js in ESM (ECMAScript Modules) format
export default {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'angular',
      releaseRules: [
        { breaking: true, release: 'patch' },
        { type: 'feat', release: 'patch' },
        { type: 'fix', release: 'patch' },
        { type: 'perf', release: 'patch' },
        { type: 'revert', release: 'patch' },
        { type: 'docs', release: 'patch' },
        { type: 'style', release: 'patch' },
        { type: 'chore', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'test', release: 'patch' },
        { type: 'build', release: 'patch' },
        { type: 'ci', release: 'patch' },
      ]
    }],
    '@semantic-release/release-notes-generator',
    ['@semantic-release/github', {
      // successComment: false,
    }],
  ]
}