import matter from 'gray-matter';
import { marked } from 'marked';

export interface Tip {
	title: string;
	slug: string;
	tags: string[];
	date: string;
	summary?: string;
	html: string;
}

const files = import.meta.glob('/content/tips/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

export const tips: Tip[] = Object.values(files).map((raw) => {
	const { data, content } = matter(raw);

	return {
		title: String(data.title),
		slug: String(data.slug),
		tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
		date: data.date instanceof Date ? data.date.toISOString() : String(data.date ?? ''),
		summary: data.summary ? String(data.summary) : undefined,
		html: marked.parse(content) as string
	};
});

export function getTip(slug: string) {
	return tips.find((tip) => tip.slug === slug);
}
