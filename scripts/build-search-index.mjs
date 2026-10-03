import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const contentRoot = path.resolve('content/tips');
const outputPath = path.resolve('static/search-index.json');

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
			summary: data.summary ? String(data.summary) : ''
		};
	})
);

index.sort((a, b) => a.title.localeCompare(b.title));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(index)}\n`);

console.log(`Generated ${index.length} search records at ${outputPath}`);
