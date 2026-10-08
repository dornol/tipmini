import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const contentRoot = path.resolve('content/tips');
const outputPath = path.resolve('static/search-index.json');
const staticRoot = path.resolve('static');
const siteUrl = 'https://tipmini.dornol.dev';

function escapeXml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function toIsoDate(value) {
	if (!value) return undefined;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

async function findMarkdownFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...(await findMarkdownFiles(entryPath)));
		} else if (entry.isFile() && entry.name.endsWith('.md')) {
			files.push(entryPath);
		}
	}

	return files;
}

const files = await findMarkdownFiles(contentRoot);
const slugs = new Set();

const index = await Promise.all(
	files.map(async (filePath) => {
		const { data } = matter(await readFile(filePath, 'utf8'));
		const slug = String(data.slug);

		if (slugs.has(slug)) {
			throw new Error(`Duplicate tip slug: ${slug}`);
		}

		slugs.add(slug);

		return {
			title: String(data.title),
			slug,
			tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
			summary: data.summary ? String(data.summary) : '',
			date: toIsoDate(data.date),
			updated: toIsoDate(data.updated)
		};
	})
);

index.sort((a, b) => a.title.localeCompare(b.title));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
	outputPath,
	`${JSON.stringify(index.map(({ date: _date, updated: _updated, ...tip }) => tip))}\n`
);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc></url>
${index
	.map(
		(tip) =>
			`  <url><loc>${siteUrl}/tips/${encodeURIComponent(tip.slug)}/</loc>${tip.updated ?? tip.date ? `<lastmod>${escapeXml(tip.updated ?? tip.date)}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>
`;

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tipmini</title>
    <link>${siteUrl}/</link>
    <description>일상과 생산성에 바로 활용할 수 있는 유용한 꿀팁 아카이브</description>
    <language>ko-KR</language>
${[...index]
	.sort((a, b) => String(b.date).localeCompare(String(a.date)))
	.map(
		(tip) => `    <item>
      <title>${escapeXml(tip.title)}</title>
      <link>${siteUrl}/tips/${encodeURIComponent(tip.slug)}/</link>
      <guid>${siteUrl}/tips/${encodeURIComponent(tip.slug)}/</guid>
      <description>${escapeXml(tip.summary)}</description>${tip.date ? `
      <pubDate>${new Date(tip.date).toUTCString()}</pubDate>` : ''}
    </item>`
	)
	.join('\n')}
  </channel>
</rss>
`;

const llms = `# Tipmini

> 일상과 생산성에 바로 활용할 수 있는 한국어 꿀팁 아카이브입니다.

## Articles

${index
	.map(
		(tip) =>
			`- [${tip.title}](${siteUrl}/tips/${encodeURIComponent(tip.slug)}/): ${tip.summary}${tip.tags.length ? ` (태그: ${tip.tags.join(', ')})` : ''}`
	)
	.join('\n')}
`;

await Promise.all([
	writeFile(path.join(staticRoot, 'sitemap.xml'), sitemap),
	writeFile(path.join(staticRoot, 'feed.xml'), feed),
	writeFile(path.join(staticRoot, 'llms.txt'), llms)
]);

console.log(`Generated search index, sitemap, RSS feed, and llms.txt for ${index.length} tips`);
