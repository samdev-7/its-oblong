<script lang="ts">
	import { onMount } from 'svelte';
	import { validate_url } from '$lib/validation';
	import { browser } from '$app/environment';

	var link_input: string = '';

	onMount(() => {
		let link_input_e = document.getElementById('link-input') as HTMLInputElement;
		if (link_input_e) {
			link_input_e.focus();

			// Prevent flash due to state change on load
			link_input_e.className = link_input_e.className
				.replace('border-blue-500', 'border-zinc-300')
				.replace('ring', '');
		}
	});

	function onFormSubmit(e: SubmitEvent): void {}

	$: {
		let url_valid = validate_url(link_input);
		console.log(url_valid);

		if (browser) {
			let link_input_e = document.getElementById('link-input') as HTMLInputElement;
			if (link_input_e) {
			}
		}
	}
</script>

<noscript>
	<meta http-equiv="refresh" content="0; url=/noscript" />
</noscript>

<!-- Hero -->
<div class="py-20 flex flex-col text-center px-8">
	<p
		class="bg-white mx-auto text-md font-medium text-zinc-700 border-2 border-zinc-200 rounded-full py-1 px-5"
	>
		Coming soon! 🚀
	</p>
	<div class="flex mx-auto text-6xl font-bold py-6">
		<h1>
			Create <span
				class="bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent"
				>Short</span
			>
			Links,
			<span class="relative">
				<span
					class="italic bg-gradient-to-br from-teal-500 to-blue-500 bg-clip-text text-transparent"
				>
					Fast
				</span>

				<span
					class="-z-10 pointer-events-none select-none absolute right-1 italic bg-gradient-to-br from-teal-500/30 to-blue-500/30 bg-clip-text text-transparent"
					aria-hidden="true"
				>
					Fast
				</span>
				<span
					class="-z-20 pointer-events-none select-none absolute right-2 italic bg-gradient-to-br from-teal-50/25 to-blue-500/25 bg-clip-text text-transparent"
					aria-hidden="true"
				>
					Fast
				</span>
				<span
					class="-z-30 pointer-events-none select-none absolute right-3 italic bg-gradient-to-br from-teal-500/10 to-blue-500/10 bg-clip-text text-transparent"
					aria-hidden="true"
				>
					Fast
				</span>
			</span>
		</h1>
	</div>
	<p class="text-center text-zinc-800 text-lg py-4">
		Completely free, popups-less, no sign-ups, and zero ads.<br />Its.obl.ong is the best way to
		create super short links that can be shared anywhere.
	</p>
</div>

<div class="flex justify-center">
	<form
		class="grow flex justify-center max-w-3xl mx-4"
		novalidate
		on:submit|preventDefault={(e) => onFormSubmit(e)}
	>
		<!-- Link Input -->
		<div class="w-full">
			<label for="link-input" class="text-sm text-zinc-500 pl-2">
				Enter the link you want to shorten
			</label>
			<input
				class="w-full font-medium placeholder-zinc-400 ring border-blue-500 border-2 py-2 px-4 my-0.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring motion-safe:transition-colors"
				type="url"
				placeholder="https://google.com"
				id="link-input"
				required
				bind:value={link_input}
				aria-live="polite"
			/>
		</div>
	</form>
</div>
