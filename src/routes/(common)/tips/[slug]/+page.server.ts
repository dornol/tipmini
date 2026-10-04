import { error } from '@sveltejs/kit';
import { getTip, tips } from '#lib/server/tips.js';

export const prerender = true;

export function entries() {
	return tips.map((tip) => ({ slug: tip.slug }));
}

export function load({ params }) {
	const tip = getTip(params.slug);

	if (!tip) {
		error(404, 'Tip not found');
	}

	return {
		tip,
		giscus: {
			repo: import.meta.env.PUBLIC_GISCUS_REPO ?? '',
			repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID ?? '',
			category: import.meta.env.PUBLIC_GISCUS_CATEGORY ?? '',
			categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID ?? ''
		}
	};
}
