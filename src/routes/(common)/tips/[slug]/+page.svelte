<script lang="ts">
	import GiscusComments from '#lib/components/GiscusComments.svelte';

	let { data } = $props();
	const siteUrl = 'https://tipmini.dornol.dev';
	let canonicalUrl = $derived(`${siteUrl}/tips/${data.tip.slug}/`);
	let description = $derived(data.tip.summary ?? data.tip.title);
	let structuredData = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Article',
				headline: data.tip.title,
				description,
				keywords: data.tip.tags,
				datePublished: data.tip.date,
				dateModified: data.tip.updated ?? data.tip.date,
				inLanguage: 'ko-KR',
				mainEntityOfPage: canonicalUrl,
				author: { '@type': 'Organization', name: 'Tipmini', url: siteUrl },
				publisher: { '@type': 'Organization', name: 'Tipmini', url: siteUrl }
			},
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Tipmini', item: `${siteUrl}/` },
					{ '@type': 'ListItem', position: 2, name: data.tip.title, item: canonicalUrl }
				]
			}
		]
	});
	let structuredDataJson = $derived(JSON.stringify(structuredData).replaceAll('<', '\\u003c'));

	const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'Asia/Seoul'
	});

	function formatDate(value: string) {
		return dateFormatter.format(new Date(value));
	}
</script>

<svelte:head>
	<title>{data.tip.title} - Tipmini</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={data.tip.tags.join(', ')} />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<link rel="canonical" href={canonicalUrl} />
	<link rel="alternate" type="application/rss+xml" title="Tipmini RSS" href={`${siteUrl}/feed.xml`} />
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content="Tipmini" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:title" content={`${data.tip.title} - Tipmini`} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="article:published_time" content={data.tip.date} />
	<meta property="article:modified_time" content={data.tip.updated ?? data.tip.date} />
	{#each data.tip.tags as tag}
		<meta property="article:tag" content={tag} />
	{/each}
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={`${data.tip.title} - Tipmini`} />
	<meta name="twitter:description" content={description} />
	{@html `<script type="application/ld+json">${structuredDataJson}</script>`}
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12">
	<a class="text-sm text-slate-500 hover:text-slate-900" href="/">← 검색으로 돌아가기</a>

	<article class="prose prose-slate mt-8 max-w-none">
		<h1>{data.tip.title}</h1>
		{#if data.tip.summary}
			<p class="lead">{data.tip.summary}</p>
		{/if}
		<div class="not-prose mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
			<time datetime={data.tip.date}>작성일 {formatDate(data.tip.date)}</time>
			{#if data.tip.updated}
				<time datetime={data.tip.updated}>최근 수정일 {formatDate(data.tip.updated)}</time>
			{/if}
		</div>
		<ul class="not-prose mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="태그">
			{#each data.tip.tags as tag}
				<li class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">#{tag}</li>
			{/each}
		</ul>

		<div class="mt-8">{@html data.tip.html}</div>
	</article>

	<GiscusComments term={data.tip.slug} {...data.giscus} />
</main>

<style>
	:global(.prose table) {
		display: block;
		overflow-x: auto;
		white-space: nowrap;
	}
</style>
