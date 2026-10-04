<script lang="ts">
	import { onMount } from 'svelte';

	let {
		term,
		repo,
		repoId,
		category,
		categoryId
	}: {
		term: string;
		repo: string;
		repoId: string;
		category: string;
		categoryId: string;
	} = $props();

	const configured = $derived(Boolean(repo && repoId && category && categoryId));

	let container = $state<HTMLDivElement>();

	onMount(() => {
		const mount = container;
		if (!configured || !mount) return;

		const script = document.createElement('script');
		script.src = 'https://giscus.app/client.js';
		script.async = true;
		script.crossOrigin = 'anonymous';
		script.setAttribute('data-repo', repo);
		script.setAttribute('data-repo-id', repoId);
		script.setAttribute('data-category', category);
		script.setAttribute('data-category-id', categoryId);
		script.setAttribute('data-mapping', 'specific');
		script.setAttribute('data-term', term);
		script.setAttribute('data-strict', '0');
		script.setAttribute('data-reactions-enabled', '1');
		script.setAttribute('data-emit-metadata', '0');
		script.setAttribute('data-input-position', 'top');
		script.setAttribute('data-theme', 'light');
		script.setAttribute('data-lang', 'ko');

		mount.appendChild(script);

		return () => {
			mount.replaceChildren();
		};
	});
</script>

<section class="comments" aria-labelledby="comments-title">
	<h2 id="comments-title">댓글</h2>
	{#if configured}
		<div bind:this={container}></div>
	{:else}
		<p class="setup-message">
			GitHub Discussions와 giscus 설정이 완료되면 이곳에서 댓글을 남길 수 있습니다.
		</p>
	{/if}
</section>

<style>
	.comments {
		margin-top: 4rem;
		border-top: 1px solid #e2e8f0;
		padding-top: 2rem;
	}

	.comments h2 {
		margin: 0 0 1.25rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: #0f172a;
	}

	.setup-message {
		color: #64748b;
		font-size: 0.9rem;
	}
</style>
