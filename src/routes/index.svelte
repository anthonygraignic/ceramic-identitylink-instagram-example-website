<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import OnlyConnected from '$lib/components/OnlyConnected.svelte';
	import { variables } from '$lib/modules/variables';
	import { self, did } from '$lib/modules/wallet';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { decodeJWT } from 'did-jwt';

	let instagramUsername;
	let code = $page.query.get('code') || '';
	// remove '#_' additional at end of URI (challengeCode is only alpha numeric, no special char so it's safe!)
	// https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-access-tokens-and-permissions/
	let state = $page.query.get('state')?.replace('#_', '') || '';

	const fbLoginError = $page.query.get('error');
	const fbLoginErrorReason = $page.query.get('error_reason');
	const fbLoginErrorDescription = $page.query.get('error_description');

	enum VerificationStep {
		VERIFY,
		CONFIRM,
		SUCCESS
	}

	let step = code && state ? VerificationStep.CONFIRM : VerificationStep.VERIFY;

	let result;
	let errorMessage;
	let loadingRequest = false;

	onMount(() => {
		if (fbLoginError) {
			errorMessage = `Facebook Login Error: ${fbLoginError}, ${fbLoginErrorReason}, ${fbLoginErrorDescription}`;
		}

		const query = new URLSearchParams(document.location.search);

		if (query.has('code')) {
			code = query.get('code') || '';
		}
		if (query.has('state')) {
			state = query.get('state')?.replace('#_', '') || '';
		}

		if (state) {
			console.log(`Challenge Code: ${state}`);
		} else {
			console.log('No challenge code found in URL Query Params, starting at step 1: VERIFY');
		}

		step = code && state ? VerificationStep.CONFIRM : VerificationStep.VERIFY;
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

			step = VerificationStep.SUCCESS;
			await addInstagramAttestation(result.data.attestation);
			alert(
				'Congrats, you linked your Instagram account to your 3ID account with a Verifiable Credential.'
			);
		} catch (err) {
			console.error(err);
			errorMessage = err;
		} finally {
			loadingRequest = false;
		}
	}

	const INSTAGRAM_HOST = 'instagram.com';

	function getUsernameFromJWTAttestation(attestation: string): string {
		const decodedJWT = decodeJWT(attestation);
		return decodedJWT.payload.vc.credentialSubject.account.username;
	}

	export async function addInstagramAttestation(attestation) {
		// const accounts = await $self.getSocialAccounts();
		const accounts = (await $self.client.dataStore.get('alsoKnownAs', $did.id)?.accounts) ?? [];
		const username = getUsernameFromJWTAttestation(attestation);

		const existing = accounts.find((a) => a.host === INSTAGRAM_HOST && a.id === username);
		if (existing == null) {
			accounts.push({
				protocol: 'https',
				host: INSTAGRAM_HOST,
				id: username,
				attestations: [{ 'did-jwt-vc': attestation }]
			});
		} else {
			existing.attestations = existing.attestations ?? [];
			existing.attestations.push({ 'did-jwt-vc': attestation });
		}
		// await $self.setAlsoKnownAsAccounts({ accounts });
		await $self.client.dataStore.set('alsoKnownAs', { accounts });

		console.log('Added attestation to AlsoKnownAsAccounts');
	}
</script>

<svelte:head>
	<title>Ceramic Identity Link - Instagram</title>
</svelte:head>

<main>
	<section>
		<h1>
			Verify your Instagram account through <a
				href="https://github.com/ceramicstudio/identitylink-services"
				rel="external noopener"
				target="_blank">Identity Link Services</a
			>
		</h1>

		<p>
			This project is an example of how you can issue a <a
				href="https://www.w3.org/TR/vc-data-model/"
				rel="external noopener"
				target="_blank">verifiable credential</a
			>
			that link a decentralized identifier (DID) to your Instagram account on
			<a href="https://ceramic.network/" rel="external noopener" target="_blank">Ceramic network</a
			>. It is configured on the <b>clay testnet</b> network.
		</p>

		<h2>Instructions:</h2>
		<ol class="instructions">
			<li>Connect with Metamask and 3ID</li>
			<li>
				Click on the button to authorize our app to access your Instagram account (you will be
				redirected to Instagram Log In).
			</li>
			<li>Authorize our app (read-only access), you will be redirected to this same page.</li>
			<li>Connect again and generate your verifiable credential by clicking on the button</li>
		</ol>
	</section>

	<OnlyConnected>
		<section>
			{#if step == VerificationStep.VERIFY}
				<h2>Verify</h2>
				<p>Your DID: <b>{$self.id}</b></p>
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
				<h2>Confirm</h2>

				<p>
					You successfully authenticated on <b>Instagram</b> 👏, now generate the proof by clicking on
					the following button:
				</p>

				<div class="confirm">
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
				</div>
				<p>Your DID: <b>{$self.id}</b></p>
				<p>Your challenge code: <b>{state}</b></p>
			{:else if step == VerificationStep.SUCCESS}
				<h2>Success 🥳</h2>
				<p>
					We successfully issued a Verifiable Credential that link a decentralized identifier (DID)
					to your Instagram account on Ceramic network.
					<br />
					We added it to your AKA (Also Known As) Accounts.
				</p>
				<br />
				{#if result}
					<p>
						Attestation: {result.data.attestation}
					</p>
				{/if}
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

	.instructions {
		@apply list-decimal list-inside ml-3;
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
		@apply text-center my-8;
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
