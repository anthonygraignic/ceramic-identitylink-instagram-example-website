<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import OnlyConnected from '$lib/components/OnlyConnected.svelte';
	import { variables } from '$lib/modules/variables';
	import { self, did } from '$lib/modules/wallet';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let instagramUsername;
	const code = $page.query.get('code') || '';
	// remove '#_' additional at end of URI (challengeCode is only alpha numeric, no special char so it's safe!)
	// https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-access-tokens-and-permissions/
	let state = $page.query.get('state')?.replace('#_', '') || '';

	console.log(state);

	const fbLoginError = $page.query.get('error');
	const fbLoginErrorReason = $page.query.get('error_reason');
	const fbLoginErrorDescription = $page.query.get('error_description');

	enum VerificationStep {
		VERIFY,
		CONFIRM
	}

	// let step = VerificationStep.REQUEST;
	let step = code ? VerificationStep.CONFIRM : VerificationStep.VERIFY;

	let result;
	let errorMessage;
	let loadingRequest = false;

	onMount(() => {
		if (fbLoginError) {
			errorMessage = `Facebook Login Error: ${fbLoginError}, ${fbLoginErrorReason}, ${fbLoginErrorDescription}`;
		}
	});

	async function confirmInstagram() {
		try {
			loadingRequest = true;

			const jws = await $did.createJWS({ challengeCode: state });
			console.log(jws);

			const response = await fetch(`${variables.IDENTITY_LINK_URL}/api/v0/confirm-instagram`, {
				method: 'post',
				body: JSON.stringify({ jws: jws, code })
			});
			if (!response.ok) {
				let serverErrorMessage = '';
				try {
					result = await response.json();
					console.log(result);
					serverErrorMessage = result.message;
				} catch (err) {
					console.log(err);
				}
				errorMessage = `There was a problem: ${response.status} status code, ${serverErrorMessage}`;
				throw new Error(errorMessage);
			}

			result = await response.json();
			console.log(result);
		} catch (err) {
			console.error(err);
			errorMessage = err;
		} finally {
			loadingRequest = false;
		}
	}
</script>

<svelte:head>
	<title>Ceramic Identity Link - Instagram</title>
</svelte:head>

<main>
	<h1>
		Verify your Instagram account through <a
			href="https://github.com/ceramicstudio/identitylink-services"
			rel="external noopener"
			target="_blank">Identity Link Services</a
		>
	</h1>

	<OnlyConnected>
		<p>Your DID: <b>{$self.id}</b></p>

		<section>
			{#if step == VerificationStep.VERIFY}
				<div class="verify">
					<label for="instagram-handle" />
					<input
						type="text"
						name="instagram-handle"
						id="instagram-handle"
						placeholder="Instagram's handle e.g. wallkanda"
						bind:value={instagramUsername}
					/>
					<a
						href="{variables.IDENTITY_LINK_URL}/api/v0/request-instagram?did={$self.id}&username={instagramUsername}"
					>
						Verify on Instagram</a
					>
				</div>
			{:else if step == VerificationStep.CONFIRM}
				<div class="confirm">
					<p>
						You successfully authenticated on <b>Instagram</b> 🥳🥳🥳, now generate the proof by clicking
						on the following button:
					</p>
					<button on:click={confirmInstagram}>
						<div class="generate-button-content">
							{#if loadingRequest}
								<svg
									class="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-black"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									/>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<p>Generating...</p>
							{:else}
								Generate Verifiable Credential
							{/if}
						</div>
					</button>

					{#if result}
						<p />
					{/if}
				</div>
			{/if}
		</section>
	</OnlyConnected>
	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
</main>

<style lang="postcss">
	main {
		@apply container;
	}

	section {
		@apply my-4;
	}

	.list-decimal {
		@apply pl-8 py-2;
	}

	input {
		@apply rounded py-1 px-1;
	}

	button {
		@apply font-bold px-2 py-2 rounded;
		@apply text-gray-50 dark:text-gray-800;
		@apply bg-gray-800 dark:bg-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50;
	}

	.verify {
		@apply grid gap-4 items-center justify-center;
	}

	.confirm {
		@apply flex flex-col space-y-4 items-center;
		@apply text-center;
	}

	.verify a {
		@apply font-bold px-2 py-2 rounded;
		@apply text-gray-50 dark:text-gray-800;
		@apply bg-gray-800 dark:bg-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50;
		text-decoration: none;
		@apply text-center;
	}
	.generate-button-content {
		@apply flex flex-row items-center;
	}

	.error {
		@apply text-red-500;
	}
</style>
