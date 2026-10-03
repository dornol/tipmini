<script lang="ts">
	import { goto } from '$app/navigation';
	import { asset } from '$app/paths';

	type SearchTip = {
		title: string;
		slug: string;
		tags: string[];
		summary: string;
	};

	let { compact = false }: { compact?: boolean } = $props();

	let query = $state('');
	let submitted = $state(false);
	let searchIndex = $state<SearchTip[]>([]);
	let indexLoaded = $state(false);
	let indexLoading = $state(false);
	let indexError = $state(false);
	let highlightedTagIndex = $state(-1);

	async function ensureIndex() {
		if (indexLoaded || indexLoading) return;

		indexLoading = true;
		indexError = false;

		try {
			const response = await fetch(asset('search-index.json'));
			if (!response.ok) throw new Error('Failed to load search index');

			searchIndex = await response.json();
			indexLoaded = true;
		} catch (error) {
			console.error(error);
			indexError = true;
		} finally {
			indexLoading = false;
		}
	}

	let allTags = $derived(
		[...new Set(searchIndex.flatMap((tip) => tip.tags))].sort((a, b) => a.localeCompare(b))
	);

	let tagSuggestions = $derived(
		allTags
			.filter((tag) => tag.toLowerCase().includes(query.trim().replace(/^#/, '').toLowerCase()))
			.slice(0, 8)
	);

	let results = $derived(
		searchIndex.filter((tip) => {
			const rawKeyword = query.trim().toLowerCase();
			const isTagSearch = rawKeyword.startsWith('#');
			const keyword = rawKeyword.replace(/^#/, '');

			if (!keyword) return false;
			if (isTagSearch) return tip.tags.some((tag) => tag.toLowerCase() === keyword);

			return [tip.title, tip.summary, ...tip.tags].some((value) =>
				String(value).toLowerCase().includes(keyword)
			);
		})
	);

	async function submitSearch() {
		await ensureIndex();
		if (!query.trim()) return;

		submitted = true;
		if (compact) await goto('/');
	}

	async function selectTag(tag: string) {
		query = `#${tag}`;
		highlightedTagIndex = -1;
		await ensureIndex();
		submitted = true;
		if (compact) await goto('/');
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			highlightedTagIndex = -1;
			return;
		}

		if (!query.trim() || !tagSuggestions.length) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlightedTagIndex = (highlightedTagIndex + 1) % tagSuggestions.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlightedTagIndex = highlightedTagIndex <= 0 ? tagSuggestions.length - 1 : highlightedTagIndex - 1;
		} else if (event.key === 'Enter' && highlightedTagIndex >= 0) {
			event.preventDefault();
			selectTag(tagSuggestions[highlightedTagIndex]);
		}
	}
</script>

<section class:compact class="search-area">
	<div class="search-content">
		{#if !compact}
			<p class="text-sm font-medium text-blue-600">Tipmini</p>
			<h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">무엇을 찾고 있나요?</h1>
		{/if}

		<form
			class={compact ? 'relative mt-0' : 'relative mt-5 sm:mt-8'}
			onsubmit={(event) => {
				event.preventDefault();
				submitSearch();
			}}
		>
			<label class="sr-only" for="tip-search">팁 검색</label>
			<div class="flex items-center rounded-full border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 sm:px-5">
				<svg class="mr-2 h-5 w-5 shrink-0 text-slate-400 sm:mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-4-4" />
				</svg>
				<input
					id="tip-search"
					type="search"
					bind:value={query}
					role="combobox"
					aria-autocomplete="list"
					aria-controls="tag-suggestions"
					aria-expanded={Boolean(query.trim() && !submitted && tagSuggestions.length)}
					aria-activedescendant={highlightedTagIndex >= 0 ? `tag-suggestion-${highlightedTagIndex}` : undefined}
					oninput={() => {
						submitted = false;
						highlightedTagIndex = -1;
						ensureIndex();
					}}
					onkeydown={handleSearchKeydown}
					placeholder="팁, 키워드 또는 #태그 검색"
					class="min-w-0 w-full border-0 bg-transparent py-3.5 text-sm outline-none focus:ring-0 sm:py-4 sm:text-base"
				/>
			</div>

			{#if query.trim() && !submitted && tagSuggestions.length}
				<div id="tag-suggestions" role="listbox" class="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 text-left shadow-lg">
					<p class="px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400">태그 자동완성</p>
					{#each tagSuggestions as tag, index}
						<button
							type="button"
							id={`tag-suggestion-${index}`}
							role="option"
							aria-selected={highlightedTagIndex === index}
							onclick={() => selectTag(tag)}
							class:bg-slate-100={highlightedTagIndex === index}
							class="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
						>
							#{tag}
						</button>
					{/each}
				</div>
			{/if}
		</form>

		{#if indexLoading}
			<p class="mt-3 text-sm text-slate-400">검색 준비 중...</p>
		{:else if indexError}
			<p class="mt-3 text-sm text-red-500">검색 데이터를 불러오지 못했습니다.</p>
		{/if}
	</div>

	{#if !compact && submitted}
		<section class="search-results" aria-live="polite">
			<p class="mb-4 text-sm text-slate-500">검색 결과 {results.length}개</p>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each results as tip}
					<a href={`/tips/${tip.slug}/`} class="rounded-xl border border-slate-200 p-5 transition hover:border-blue-400 hover:shadow-sm">
						<h2 class="text-lg font-semibold text-slate-900">{tip.title}</h2>
						{#if tip.summary}
							<p class="mt-2 text-sm leading-6 text-slate-600">{tip.summary}</p>
						{/if}
						<div class="mt-4 flex flex-wrap gap-2">
							{#each tip.tags as tag}
								<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">#{tag}</span>
							{/each}
						</div>
					</a>
				{:else}
					<p class="col-span-full py-12 text-center text-slate-500">검색 결과가 없습니다.</p>
				{/each}
			</div>
		</section>
	{/if}
</section>

<style>
	.search-area {
		min-height: 70vh;
		padding: 6rem 1rem;
		text-align: center;
		transition: min-height 260ms ease, padding 260ms ease;
	}

	.search-area.compact {
		min-height: 0;
		position: sticky;
		top: 0;
		z-index: 20;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgb(226 232 240);
		background: rgb(248 250 252 / 0.9);
		backdrop-filter: blur(12px);
	}

	.search-content {
		width: min(100%, 42rem);
		margin: 0 auto;
		transition: width 260ms ease;
	}

	.search-area.compact .search-content {
		width: min(100%, 48rem);
	}

	.search-results {
		width: min(100%, 48rem);
		margin: 4rem auto 0;
		text-align: left;
	}

	@media (max-width: 640px) {
		.search-area.compact {
			padding: 0.625rem 0.75rem;
		}

		.search-area.compact .search-content {
			width: 100%;
		}
	}
</style>
