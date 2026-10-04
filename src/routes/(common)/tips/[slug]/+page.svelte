<script lang="ts">
	import GiscusComments from '#lib/components/GiscusComments.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.tip.title} - Tipmini</title>
	<meta name="description" content={data.tip.summary} />
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-12">
	<a class="text-sm text-slate-500 hover:text-slate-900" href="/">← 검색으로 돌아가기</a>

	<article class="prose prose-slate mt-8 max-w-none">
		<h1>{data.tip.title}</h1>
		{#if data.tip.summary}
			<p class="lead">{data.tip.summary}</p>
		{/if}

		{@html data.tip.html}
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
