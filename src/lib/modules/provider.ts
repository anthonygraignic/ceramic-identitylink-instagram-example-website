import { ethers } from 'ethers';
import { variables } from './variables';
import { EthereumAuthProvider, SelfID } from '@self.id/web';
// import type { EthereumProvider } from '@self.id/web';
// import type { Account as AlsoKnownAsAccount } from '@datamodels/identity-accounts-web';
// import type { BasicProfile } from '@datamodels/identity-profile-basic';
// import { PublicID } from '@self.id/core';
import { WebClient } from '@self.id/web';

let self = null;
let ethereumProvider = null;
let provider = null;

export async function connectWallet() {
	ethereumProvider = window.ethereum;
	if (!ethereumProvider) {
		throw new Error('No ethereum provider.');
	}

	const client = new WebClient({
		ceramic: variables.CERAMIC,
		connectNetwork: variables.CERAMIC_CONNECT_NETWORK
		// ceramic: 'local',
		// connectNetwork: 'testnet-clay'
	});

	const addresses = await ethereumProvider.request({ method: 'eth_requestAccounts' });

	// A Web3Provider wraps a standard Web3 provider, which is
	// what Metamask injects as window.ethereum into each page
	provider = new ethers.providers.Web3Provider(ethereumProvider);

	const address = await provider.getSigner().getAddress();

	const authProvider = new EthereumAuthProvider(ethereumProvider, address);
	console.log(authProvider);
	const did = await client.authenticate(authProvider, true);

	console.log(did);

	self = new SelfID({ client, did });

	console.log(self);

	return { provider, ethereumProvider, self };
}
