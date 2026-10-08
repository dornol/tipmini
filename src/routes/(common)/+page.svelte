<script lang="ts">
	const siteUrl = 'https://tipmini.dornol.dev';
	const description = '일상과 생산성에 바로 활용할 수 있는 유용한 꿀팁 아카이브';
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Tipmini',
		url: `${siteUrl}/`,
		description,
		inLanguage: 'ko-KR'
	};
	const structuredDataJson = JSON.stringify(structuredData).replaceAll('<', '\\u003c');
</script>

<svelte:head>
	<title>Tipmini - 유용한 꿀팁 모음</title>
	<meta name="description" content={description} />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<link rel="canonical" href={`${siteUrl}/`} />
	<link rel="alternate" type="application/rss+xml" title="Tipmini RSS" href={`${siteUrl}/feed.xml`} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Tipmini" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:title" content="Tipmini - 유용한 꿀팁 모음" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={`${siteUrl}/`} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Tipmini - 유용한 꿀팁 모음" />
	<meta name="twitter:description" content={description} />
	{@html `<script type="application/ld+json">${structuredDataJson}</script>`}
</svelte:head>
