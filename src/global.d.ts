/// <reference types="@sveltejs/kit" />
/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
	VITE_CERAMIC: string;
	VITE_CERAMIC_CONNECT_NETWORK: string;
	VITE_IDENTITY_LINK_URL: string;
}
