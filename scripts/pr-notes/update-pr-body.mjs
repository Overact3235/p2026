import { formatPrBody, upsertGeneratedSection } from './note-formatters.mjs';

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const pullRequestNumber = Number(process.env.PR_NUMBER);
const apiBaseUrl = process.env.GITHUB_API_URL || 'https://api.github.com';

if (!token) {
  throw new Error('GITHUB_TOKEN is required.');
}

if (!repository || !repository.includes('/')) {
  throw new Error('GITHUB_REPOSITORY must be in owner/repo format.');
}

if (!Number.isInteger(pullRequestNumber) || pullRequestNumber <= 0) {
  throw new Error('PR_NUMBER must be a positive integer.');
}

const [owner, repo] = repository.split('/');

async function githubRequest(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'p2026-pr-notes',
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function paginate(path) {
  const results = [];
  let page = 1;

  while (true) {
    const separator = path.includes('?') ? '&' : '?';
    const pageItems = await githubRequest(`${path}${separator}per_page=100&page=${page}`);
    if (!Array.isArray(pageItems) || pageItems.length === 0) {
      break;
    }

    results.push(...pageItems);

    if (pageItems.length < 100) {
      break;
    }

    page += 1;
  }

  return results;
}

const pullRequest = await githubRequest(`/repos/${owner}/${repo}/pulls/${pullRequestNumber}`);
const commits = await paginate(`/repos/${owner}/${repo}/pulls/${pullRequestNumber}/commits`);
const mappedCommits = commits.map((commit) => ({
  hash: commit.sha,
  message: commit.commit?.message ?? ''
}));

const generatedBody = formatPrBody({
  branchName: pullRequest.head?.ref ?? `pr-${pullRequestNumber}`,
  commits: mappedCommits
});

const nextBody = upsertGeneratedSection(pullRequest.body ?? '', generatedBody);

if ((pullRequest.body ?? '').trim() === nextBody.trim()) {
  console.log('PR body is already up to date.');
  process.exit(0);
}

await githubRequest(`/repos/${owner}/${repo}/pulls/${pullRequestNumber}`, {
  method: 'PATCH',
  body: JSON.stringify({ body: nextBody })
});

console.log(`Updated PR #${pullRequestNumber} notes.`);
