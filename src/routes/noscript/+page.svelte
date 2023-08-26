<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		window.location.replace('/');
	});
</script>

<noscript>
	<div class="flex flex-col min-h-screen">
		<div class="m-auto text-center">
			<h1 class="text-4xl font-bold py-4 px-4">JavaScript is Disabled</h1>
			<p class="">
				To use this site, it is necessary to enable JavaScript.<br /><a
					href="https://www.enablejavascript.io/"
					target="_blank"
					rel="noopener"
					class="hover:underline">https://www.enablejavascript.io/</a
				>
				provides instructions how to enable JavaScript in your web browser.
			</p>
			<br />
			<p>Refresh this page after enabling JavaScript.</p>
		</div>
	</div>
</noscript>
