import { getCollection } from 'astro:content';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const site = context.site ?? new URL('https://p2026.xyz');
  const channelLink = new URL('/blog', site).toString();

  const items = posts.map((post) => {
    const url = new URL(`/blog/${post.slug}`, site).toString();

    return `
      <item>
        <title>${escapeXml(post.data.title)}</title>
        <link>${url}</link>
        <guid>${url}</guid>
        <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
        <description>${escapeXml(post.data.description)}</description>
      </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>P2026 Blog</title>
    <link>${channelLink}</link>
    <description>Project logs, thoughts, and writeups from P2026.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
