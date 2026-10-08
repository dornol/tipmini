<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';

	$effect(() => {
		page.url.pathname;
		let disposed = false;
		const buttons: HTMLButtonElement[] = [];
		const timers: ReturnType<typeof setTimeout>[] = [];

		void tick().then(() => {
			if (disposed) return;

			document.querySelectorAll<HTMLElement>('article.prose pre > code').forEach((code) => {
				const block = code.parentElement;
				if (!block || block.querySelector('.code-copy-button')) return;

				block.classList.add('code-block-with-copy');
				const button = document.createElement('button');
				button.type = 'button';
				button.className = 'code-copy-button';
				button.textContent = '복사';
				button.setAttribute('aria-label', '코드 복사');

				button.addEventListener('click', async () => {
					try {
						await navigator.clipboard.writeText(code.textContent ?? '');
						button.textContent = '복사됨';
						button.setAttribute('aria-label', '코드 복사 완료');
					} catch {
						button.textContent = '복사 실패';
					}

					timers.push(
						setTimeout(() => {
							button.textContent = '복사';
							button.setAttribute('aria-label', '코드 복사');
						}, 1600)
					);
				});

				block.append(button);
				buttons.push(button);
			});
		});

		return () => {
			disposed = true;
			buttons.forEach((button) => button.remove());
			timers.forEach(clearTimeout);
		};
	});
</script>

<style>
	:global(.prose pre.code-block-with-copy) {
		position: relative;
		padding-top: 3rem;
	}

	:global(.code-copy-button) {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		border: 1px solid rgb(71 85 105);
		border-radius: 0.375rem;
		background: rgb(30 41 59);
		padding: 0.25rem 0.625rem;
		color: rgb(226 232 240);
		font-family: ui-sans-serif, system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1.25rem;
		cursor: pointer;
	}

	:global(.code-copy-button:hover) {
		background: rgb(51 65 85);
		color: white;
	}

	:global(.code-copy-button:focus-visible) {
		outline: 2px solid rgb(96 165 250);
		outline-offset: 2px;
	}
</style>
