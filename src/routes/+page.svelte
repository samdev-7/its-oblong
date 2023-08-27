<script lang="ts">
	import { onMount } from 'svelte';
	import { validate_url } from '$lib/validation';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';

	export let data: PageData;

	let link_placeholder = data.link_placeholder;

	let link_input: string = '';

	onMount(() => {
		let link_input_e = document.getElementById('link-input') as HTMLInputElement;
		if (link_input_e) {
			link_input_e.focus();

			// Prevent flash due to state change on load
			link_input_e.className = link_input_e.className
				.replace('border-sky-500', 'border-zinc-400')
				.replace('ring', '');
		}
	});

	function onFormSubmit(e: SubmitEvent): void {}

	$: {
		link_input = link_input.trim();

		let url_valid = validate_url(link_input);
		console.log(url_valid);

		if (browser) {
			let link_input_e = document.getElementById('link-input') as HTMLInputElement;
			if (link_input_e) {
				if (url_valid || link_input.length === 0) {
					link_input_e.className = link_input_e.className
						.replace('border-red-500', 'border-zinc-400')
						.replace('focus:border-red-500', 'focus:border-sky-500')
						.replace('ring-red-500/50', 'ring-sky-500/50');
				} else {
					link_input_e.className = link_input_e.className
						.replace('border-zinc-400', 'border-red-500')
						.replace('focus:border-sky-500', 'focus:border-red-500')
						.replace('ring-sky-500/50', 'ring-red-500/50');
				}
			}
		}
	}
</script>

<noscript>
	<meta http-equiv="refresh" content="0; url=/noscript" />
</noscript>

<div class="min-h-screen flex justify-center flex-col py-16">
	<!-- Hero -->
	<div class="pb-20 flex flex-col text-center px-8">
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
		<p class="text-center text-zinc-800 text-lg py-4 font-medium">
			Completely free, popups-less, no sign-ups, and zero ads.<br />Its.obl.ong is the best way to
			create super short links that can be shared anywhere.
		</p>
	</div>

	<!-- Form -->
	<div class="flex justify-center">
		<form
			class="grow flex flex-col gap-y-6 justify-center max-w-4xl mx-4"
			novalidate
			on:submit|preventDefault={(e) => onFormSubmit(e)}
		>
			<!-- Link Input Row-->
			<div class="w-full">
				<label for="link-input" class="text-sm text-zinc-500 pl-2">
					What's the link you want to shorten?
				</label>
				<input
					class="w-full font-medium placeholder-zinc-400 ring border-sky-500 border-2 py-2 px-4 my-0.5 rounded-lg focus:outline-none focus:border-sky-500 focus:ring ring-sky-500/50 motion-safe:transition-all"
					type="url"
					placeholder={link_placeholder}
					id="link-input"
					required
					bind:value={link_input}
					aria-live="polite"
				/>
			</div>

			<!-- Expiry and Confirmation Row -->
			<div class="w-full font-medium text-center">
				<p id="expiryLabel" class="text-sm text-zinc-500 pl-2 text-left font-normal">
					When should the shortened link expire?
				</p>
				<div class="grid grid-cols-8 mt-0.5">
					<div class="h-full col-span-6 grid grid-cols-6">
						<div class="flex">
							<input
								id="expiry10m"
								type="radio"
								name="expiry"
								value="10m"
								class="w-0 peer"
								aria-labelledby="expiry10mLabel"
								required
							/>
							<label
								id="expiry10mLabel"
								for="expiry10m"
								class="grow border-2 border-r border-r-zinc-300 border-zinc-400 py-3 px-3 bg-white rounded-l-md peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-600 peer-focus-visible:border-black peer-focus-visible:border-r-2 peer-focus-visible:border-l-2 peer-focus-visible:ring-black"
							>
								10 min
							</label>
						</div>
						<div class="flex">
							<input
								id="expiry1h"
								type="radio"
								name="expiry"
								value="1h"
								class="w-0 peer"
								aria-labelledby="expiry1hLabel"
								checked
							/>
							<label
								id="expiry1hLabel"
								for="expiry1h"
								class="grow border-2 border-r border-l border-r-zinc-300 border-l-zinc-300 border-zinc-400 py-3 px-3 bg-white peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-600 peer-focus-visible:border-black peer-focus-visible:border-r-2 peer-focus-visible:border-l-2 peer-focus-visible:ring-black"
							>
								1 hour
							</label>
						</div>
						<div class="flex">
							<input
								id="expiry1d"
								type="radio"
								name="expiry"
								value="1d"
								class="w-0 peer"
								aria-labelledby="expiry1dLabel"
							/>
							<label
								id="expiry1dLabel"
								for="expiry1d"
								class="grow border-2 border-r border-l border-r-zinc-300 border-l-zinc-300 border-zinc-400 py-3 px-3 bg-white peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-600 peer-focus-visible:border-black peer-focus-visible:border-r-2 peer-focus-visible:border-l-2 peer-focus-visible:ring-black"
							>
								1 day
							</label>
						</div>
						<div class="flex">
							<input
								id="expiry1M"
								type="radio"
								name="expiry"
								value="1M"
								class="w-0 peer"
								aria-labelledby="expiry1MLabel"
							/>
							<label
								id="expiry1MLabel"
								for="expiry1M"
								class="grow border-2 border-r border-l border-r-zinc-300 border-l-zinc-300 border-zinc-400 py-3 px-3 bg-white peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-600 peer-focus-visible:border-black peer-focus-visible:border-r-2 peer-focus-visible:border-l-2 peer-focus-visible:ring-black"
							>
								1 month
							</label>
						</div>
						<div class="flex">
							<input
								id="expiry1y"
								type="radio"
								name="expiry"
								value="1y"
								class="w-0 peer"
								aria-labelledby="expiry1yLabel"
							/>
							<label
								id="expiry1yLabel"
								for="expiry1y"
								class="grow border-2 border-r border-l border-r-zinc-300 border-l-zinc-300 border-zinc-400 py-3 px-3 bg-white peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-600 peer-focus-visible:border-black peer-focus-visible:border-r-2 peer-focus-visible:border-l-2 peer-focus-visible:ring-black"
							>
								1 year
							</label>
						</div>
						<div class="flex">
							<input
								id="expiryNone"
								type="radio"
								name="expiry"
								value="none"
								class="w-0 peer"
								aria-hidden="true"
								aria-labelledby="expiryNoneLabel"
							/>
							<label
								id="expiryNoneLabel"
								for="expiryNone"
								class="grow border-2 border-l border-l-zinc-300 border-zinc-400 py-3 px-3 bg-white rounded-r-md peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-600 peer-focus-visible:border-black peer-focus-visible:border-l-2 peer-focus-visible:ring-black"
							>
								10 years
							</label>
						</div>
					</div>
					<div class="col-span-2 ml-12 text-white">
						<button
							type="submit"
							class="w-full h-full rounded-md motion-reduce:bg-sky-500 blue-gradient motion-safe:transition-all motion-safe:hover:shadow-lg motion-safe:hover:scale-105 motion-safe:hover:shadow-sky-500/50 motion-safe:active:scale-100"
						>
							Coming Soon!
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
</div>
