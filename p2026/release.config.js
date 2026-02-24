// release.config.js
// Locks all releases to patch bumps only (v1.1.x)
// To move to v1.2.x or v2.x, manually push a new tag (e.g. git tag v1.2.0 && git push origin v1.2.0)

module.exports = {
  branches: ['main'],

  plugins: [
    // Step 1: Analyze commits — force everything to patch regardless of type
    ['@semantic-release/commit-analyzer', {
      preset: 'angular',
      releaseRules: [
        { breaking: true, release: 'patch' },  // would normally be major
        { type: 'feat', release: 'patch' },  // would normally be minor
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

    // Step 2: Generate changelog / release notes from commits
    '@semantic-release/release-notes-generator',

    // Step 3: Create the GitHub Release + tag
    ['@semantic-release/github', {
      // successComment: false,  // uncomment to disable comments on PRs/issues when a release ships
    }],
  ]
}