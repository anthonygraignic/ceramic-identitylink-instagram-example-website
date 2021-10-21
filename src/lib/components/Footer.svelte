<script>
</script>

<div class="footer__container">
	<footer>
		<div class="footer__brand">
			<p>
				Made by <a href="https://twitter.com/agraignic" rel="external noopener" target="_blank"
					>@agraignic</a
				>
				with
			</p>
			<a href="https://ceramic.network/" rel="external noopener" target="_blank">
				<figure>
					<img src="logo-ceramic.svg" alt="Ceramic" />
				</figure>
			</a>
		</div>
		<div class="footer__socials">
			<a href="https://github.com/" rel="external noopener" target="_blank">Github</a>
		</div>
	</footer>
</div>

<style lang="postcss">
	.footer__container {
		@apply container relative mx-auto px-2;
		@apply md:py-24 py-8;
	}
	footer {
		border-top: 1px solid;
		z-index: 100;
		width: 100%;
		@apply border-gray-800 dark:border-white;
		@apply flex justify-between py-2;
		/* @apply grid space-x-6 lg:grid-cols-4 md:grid-cols-2 grid-cols-1; */
	}

	figure {
		width: 110px;
	}

	.footer__brand {
		@apply flex flex-row space-x-2 items-center;
		@apply lg:mr-auto lg:ml-0 mx-auto lg:text-left text-center;
	}
</style>
