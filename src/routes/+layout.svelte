<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import CodeCopyButtons from '#lib/components/CodeCopyButtons.svelte';
	import SearchBox from '#lib/components/SearchBox.svelte';
	import { page } from '$app/state';

	let { children } = $props();
	let isTipPage = $derived(page.url.pathname.startsWith('/tips/'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SearchBox compact={isTipPage} />
{@render children()}
<CodeCopyButtons />
