// Builds the generated summary section of a pull request body from its commits.
// Adapted from htpc-2026 `scripts/release/note-formatters.mjs`, with categories for the site.

export const GENERATED_START = '<!-- pr-summary:start -->';
export const GENERATED_END = '<!-- pr-summary:end -->';

const CATEGORY_ORDER = [
  'content',
  'design',
  'docs',
  'automation',
  'dependencies',
  'features',
  'fixes',
  'maintenance',
  'other'
];

const CATEGORY_CONFIG = {
  content: { title: 'Content', overview: 'updates site content' },
  design: { title: 'Design & UI', overview: 'refines the site design' },
  docs: { title: 'Documentation', overview: 'updates documentation' },
  automation: { title: 'CI & Automation', overview: 'updates CI and automation' },
  dependencies: { title: 'Dependencies', overview: 'updates dependencies' },
  features: { title: 'Features', overview: 'adds features' },
  fixes: { title: 'Fixes', overview: 'fixes bugs' },
  maintenance: { title: 'Maintenance', overview: 'includes repository maintenance' },
  other: { title: 'Other Changes', overview: 'includes other changes' }
};

function firstLine(message = '') {
  return String(message).split(/\r?\n/, 1)[0].trim();
}

function stripConventionalPrefix(line = '') {
  return line.replace(/^[a-z]+(?:\([^)]+\))?(!)?:\s*/i, '').trim();
}

function normalizeSpacing(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function capitalize(text = '') {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function oxfordJoin(items) {
  const values = unique(items);
  if (values.length === 0) return 'repository changes';
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

function parseCommit(commit) {
  const message = commit?.message ?? commit?.commit?.message ?? '';
  const line = firstLine(message);
  const match = line.match(/^(?<type>[a-z]+)(?:\([^)]+\))?(?<breaking>!)?:\s*(?<subject>.+)$/i);
  const type = match?.groups?.type?.toLowerCase() ?? 'other';
  const subject = normalizeSpacing(match?.groups?.subject ?? stripConventionalPrefix(line) ?? line);
  const breaking = Boolean(match?.groups?.breaking) || /BREAKING CHANGE/i.test(message);
  const hash = commit?.hash ?? commit?.sha ?? '';

  return { hash, message, line, type, subject, breaking };
}

function categorizeCommit(parsed) {
  const subject = parsed.subject.toLowerCase();

  // An explicit conventional type wins over keywords in the subject.
  if (parsed.type === 'docs') return 'docs';
  if (parsed.type === 'ci') return 'automation';
  if (parsed.type === 'deps') return 'dependencies';
  if (parsed.type === 'style') return 'design';

  if (/\b(css|theme|light ?mode|dark ?mode|layout|ui|ux|font|fonts|nav|contrast|toggle)\b/.test(subject)) {
    return 'design';
  }

  if (/\b(blog|post|posts|article|project page|projects|content|timeline)\b/.test(subject)) {
    return 'content';
  }

  if (/\b(bump|upgrade|dependency|dependencies|lockfile)\b/.test(subject)) {
    return 'dependencies';
  }

  if (/\b(workflow|github actions|semantic-release|deploy|netlify|lighthouse)\b/.test(subject)) {
    return 'automation';
  }

  if (/\b(readme|agents\.md|roadmap|decisions|documentation)\b/.test(subject)) {
    return 'docs';
  }

  if (parsed.type === 'feat') return 'features';
  if (parsed.type === 'fix' || parsed.type === 'perf') return 'fixes';
  if (['chore', 'refactor', 'build', 'test'].includes(parsed.type)) return 'maintenance';

  return 'other';
}

function groupCommits(commits) {
  const groups = Object.fromEntries(CATEGORY_ORDER.map((key) => [key, []]));
  const parsedCommits = commits.map(parseCommit);

  for (const parsed of parsedCommits) {
    groups[categorizeCommit(parsed)].push(parsed);
  }

  return { groups, parsedCommits };
}

function sortedCategoryKeys(groups) {
  return CATEGORY_ORDER.filter((key) => groups[key] && groups[key].length > 0);
}

function buildOverview(groups) {
  const keys = sortedCategoryKeys(groups)
    .sort((left, right) => {
      const diff = groups[right].length - groups[left].length;
      if (diff !== 0) return diff;
      return CATEGORY_ORDER.indexOf(left) - CATEGORY_ORDER.indexOf(right);
    })
    .slice(0, 3);

  if (keys.length === 0) {
    return 'This change updates the repository.';
  }

  return `This change ${oxfordJoin(keys.map((key) => CATEGORY_CONFIG[key].overview))}.`;
}

function shortHash(hash = '') {
  return String(hash).slice(0, 7);
}

function commitBulletList(commits) {
  return commits.map((commit) => `- \`${shortHash(commit.hash)}\`: ${commit.subject || commit.line || 'update'}`);
}

export function upsertGeneratedSection(existingBody = '', generatedBody = '') {
  const trimmedExisting = existingBody.trim();
  const trimmedGenerated = generatedBody.trim();

  if (!trimmedExisting) {
    return `${trimmedGenerated}\n`;
  }

  const startIndex = existingBody.indexOf(GENERATED_START);
  const endIndex = existingBody.indexOf(GENERATED_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = existingBody.slice(0, startIndex).trimEnd();
    const after = existingBody.slice(endIndex + GENERATED_END.length).trimStart();
    return [before, trimmedGenerated, after].filter(Boolean).join('\n\n').trimEnd() + '\n';
  }

  return `${trimmedGenerated}\n\n---\n\n${trimmedExisting}\n`;
}

export function formatPrBody({ branchName, commits }) {
  const { groups, parsedCommits } = groupCommits(commits);
  const lines = [
    GENERATED_START,
    `**Summary - \`${branchName}\`**`,
    '',
    buildOverview(groups),
    '',
    '---',
    '',
    '**Key Changes**',
    ''
  ];

  const categoryKeys = sortedCategoryKeys(groups);
  if (categoryKeys.length === 0) {
    lines.push('No commits yet.', '');
  } else {
    for (const key of categoryKeys) {
      const subjects = unique(groups[key].map((commit) => capitalize(commit.subject)));
      lines.push(`**${CATEGORY_CONFIG[key].title}**`, '', ...subjects.map((subject) => `- ${subject}`), '');
    }
  }

  lines.push('---', '', '**Commits**', '', ...commitBulletList(parsedCommits), GENERATED_END);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}
