<script>
	import { connect, connected } from '$lib/modules/wallet';
	import ConnectButton from './ConnectButton.svelte';
</script>

{#if !$connected}
	<div class="only-connected">
		<ConnectButton />
	</div>
{:else}
	<slot />
{/if}

<style lang="postcss">
	.only-connected {
		text-align: center;
	}
</style>
