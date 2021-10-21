<script>
	import { page } from '$app/stores';
	import { connect, connected } from '$lib/modules/wallet';
	import ConnectButton from './ConnectButton.svelte';

	$: segment = $page.path;
</script>

<div class="header__container">
	<header>
		<div>
			<a sveltekit:prefetch href="/" aria-current={segment === '/' ? true : undefined}
				><b>Ceramic Identity Link - Instagram</b>
			</a>
			<nav>
				<ul class="menu__primary">
					<!-- <li><a href="/list">List</a></li>
					<li><a href="/verify">Verify</a></li> -->
				</ul>
			</nav>
		</div>
		{#if !$connected}
			<ConnectButton />
		{:else}
			Connected
		{/if}
	</header>
</div>

<style lang="postcss">
	.header__container {
		@apply container relative mx-auto px-2;
	}

	header {
		@apply flex flex-row items-center justify-between h-20;
		border-bottom: 1px solid;
		@apply border-gray-800 dark:border-white;
		z-index: 100;
		width: 100%;
	}

	div {
		@apply flex flex-row;
	}

	ul {
		@apply flex flex-col sm:flex-row;
	}

	li {
		@apply px-4;
	}

	nav {
		margin-left: 70px;
	}

	.menu__primary [aria-current] {
		position: relative;
	}

	.menu__primary [aria-current]::after {
		content: '';
		position: absolute;
		top: calc(100% + 5px);
		left: 0;
		width: 100%;
		height: 4px;
		@apply border border-gray-800 dark:border-white;
	}

	.connect {
		@apply px-6;
		@apply text-gray-50 dark:text-gray-800;
		@apply bg-gray-800 dark:bg-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50;
	}

	.menu__sub li:hover a {
		opacity: 1;
	}

	a {
		text-decoration: none;
	}
</style>
