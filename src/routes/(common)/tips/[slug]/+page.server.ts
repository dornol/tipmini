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

	return { tip };
}
