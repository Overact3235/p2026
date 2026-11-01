// semantic-release plugin that builds release notes from the merged pull requests.
// For each commit in the release, it looks up the PR that merged it and copies the
// summary and Key Changes that `.github/workflows/pr-notes.yml` wrote into the PR body,
// plus any Manual Notes. Commits without a PR fall back to a summary built from the
// commit message, using the same formatter as the PR notes.

import { formatPrBody, GENERATED_END, GENERATED_START } from '../pr-notes/note-formatters.mjs';

const MANUAL_NOTES_PLACEHOLDER = 'Add any extra reviewer context, testing details, or follow-up items here.';

function repoSlug(repositoryUrl = '') {
  const match = repositoryUrl.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

async function githubRequest(path, { token, apiUrl, fetchImpl }) {
  const response = await fetchImpl(`${apiUrl}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'p2026-release-notes',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status}) for ${path}`);
  }

  return response.json();
}

// Returns the text between two bold headings in the generated section,
// for example everything under **Key Changes** up to the next `---`.
function sectionAfter(text, heading) {
  const start = text.indexOf(`**${heading}**`);
  if (start === -1) return '';
  const rest = text.slice(start + heading.length + 4);
  const end = rest.search(/\n---\s*\n/);
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

export function extractPrNotes(body = '') {
  const start = body.indexOf(GENERATED_START);
  const end = body.indexOf(GENERATED_END);
  if (start === -1 || end === -1 || end < start) return null;

  const generated = body.slice(start + GENERATED_START.length, end);
  // The overview sentence sits between the Summary heading and the first `---`.
  const overview = generated
    .replace(/\*\*Summary - [^*]+\*\*/, '')
    .split(/\n---\s*\n/)[0]
    .trim();
  const keyChanges = sectionAfter(generated, 'Key Changes');

  const after = body.slice(end + GENERATED_END.length);
  const manual = sectionAfter(after, 'Manual Notes');
  const manualNotes = manual && !manual.includes(MANUAL_NOTES_PLACEHOLDER) ? manual : '';

  return { overview, keyChanges, manualNotes };
}

// Squash commits list the branch's commits as `* type: subject` lines in the body.
// Turn those back into commits so the fallback summary has something to group.
function commitsFromSquash(commit) {
  const lines = String(commit.message ?? '').split(/\r?\n/);
  const bullets = lines
    .filter((line) => /^\* \S/.test(line))
    .map((line) => ({ hash: commit.hash, message: line.slice(2) }));
  return bullets.length > 0 ? bullets : [{ hash: commit.hash, message: lines[0] ?? '' }];
}

function fallbackNotes(commit) {
  const body = formatPrBody({ branchName: 'main', commits: commitsFromSquash(commit) });
  return extractPrNotes(body);
}

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function renderSection({ title, link, notes }) {
  const lines = [`### ${title}${link ? ` (${link})` : ''}`, ''];
  if (notes?.overview) lines.push(notes.overview, '');
  if (notes?.keyChanges) lines.push(notes.keyChanges, '');
  if (notes?.manualNotes) lines.push('**Notes**', '', notes.manualNotes, '');
  return lines.join('\n');
}

export async function buildReleaseNotes(context, { fetchImpl = globalThis.fetch, now = new Date() } = {}) {
  const { commits = [], nextRelease, lastRelease, options = {}, env = {}, logger = console } = context;
  const slug = repoSlug(options.repositoryUrl);
  const repoUrl = slug ? `https://github.com/${slug.owner}/${slug.repo}` : '';
  const api = {
    token: env.GITHUB_TOKEN || env.GH_TOKEN,
    apiUrl: env.GITHUB_API_URL || 'https://api.github.com',
    fetchImpl
  };

  const version = nextRelease?.version ?? '';
  const compare = repoUrl && lastRelease?.gitTag && nextRelease?.gitTag
    ? `${repoUrl}/compare/${lastRelease.gitTag}...${nextRelease.gitTag}`
    : '';
  const header = compare ? `## [${version}](${compare}) (${formatDate(now)})` : `## ${version} (${formatDate(now)})`;

  const sections = [];
  const seenPrs = new Set();

  for (const commit of commits) {
    let pulls = [];
    if (slug) {
      try {
        pulls = await githubRequest(`/repos/${slug.owner}/${slug.repo}/commits/${commit.hash}/pulls`, api);
      } catch (error) {
        logger.log(`Could not look up the PR for ${commit.hash}: ${error.message}`);
      }
    }

    const pull = pulls.find((item) => item.merged_at) ?? pulls[0];
    if (pull) {
      if (seenPrs.has(pull.number)) continue;
      seenPrs.add(pull.number);
      sections.push(renderSection({
        title: pull.title,
        link: `[#${pull.number}](${pull.html_url})`,
        notes: extractPrNotes(pull.body ?? '') ?? fallbackNotes(commit)
      }));
    } else {
      const subject = String(commit.message ?? '').split(/\r?\n/, 1)[0];
      sections.push(renderSection({
        title: subject,
        link: repoUrl ? `[${commit.hash.slice(0, 7)}](${repoUrl}/commit/${commit.hash})` : commit.hash.slice(0, 7),
        notes: fallbackNotes(commit)
      }));
    }
  }

  return [header, '', ...sections].join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

export async function generateNotes(pluginConfig, context) {
  return buildReleaseNotes(context);
}
