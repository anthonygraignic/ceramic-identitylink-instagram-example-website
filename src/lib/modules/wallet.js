import { get, writable } from 'svelte/store';
import { connectWallet } from './provider';

export const ethereumProvider = writable(null);
export const signer = writable(null);
export const provider = writable(null);
export const chainId = writable(null);
export const connecting = writable(false);
export const connected = writable(false);
export const account = writable(null);
export const self = writable(null);
export const did = writable(null);

ethereumProvider.subscribe((value) => {
	if (value) {
		value.on('accountsChanged', handleAccountsChanged);
		value.on('chainChanged', handleChainChanged);
	}
});

signer.subscribe((value) => {
	if (value) {
		connected.set(true);
	} else {
		connected.set(false);
		account.set(null);
	}
});

export async function connect() {
	connecting.set(true);
	const instances = await connectWallet();

	provider.set(instances.provider);
	ethereumProvider.set(instances.ethereumProvider);
	self.set(instances.self);
	did.set(instances.did);

	await handleChainChanged(instances.ethereumProvider.chainId);
	await handleAccountsChanged();
	connecting.set(false);
}

// on account change
async function handleAccountsChanged() {
	// set account before signer as OnlyConnected render based on signer
	const address = await getProvider().getSigner().getAddress();
	account.set(address.toLowerCase());
	signer.set(getProvider().getSigner());
	// new EthereumAuthProvider(provider, address.toLowerCase());
}

function handleChainChanged(_chainId) {
	chainId.set(_chainId);
}

export function getAccount() {
	return get(account);
}

export function getSigner() {
	return get(signer);
}

export function getEthereumProvider() {
	return get(ethereumProvider);
}

export function getProvider() {
	return get(provider);
}
