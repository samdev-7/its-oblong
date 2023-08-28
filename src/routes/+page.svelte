<script lang="ts">
	import { onMount } from 'svelte';
	import { validate_url } from '$lib/validation';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import { Turnstile } from 'svelte-turnstile';

	import { PUBLIC_TURNSTILE_INVISIBLE_KEY, PUBLIC_TURNSTILE_VISIBLE_KEY } from '$env/static/public';

	export let data: PageData;

	let loaded = false;

	let link_placeholder = data.link_placeholder;

	let link_input: string = 'https://google.com';
	let expiry_input: string = '1h';
	let turnstile_token: string = '';
	let turnstile_type: string = '';

	let link_invalid: boolean = false;
	let turnstile_requires_interaction: boolean = false;

	let loading: boolean = false;
	let turnstile_validation: boolean = false;

	onMount(() => {
		loaded = true;

		let link_input_e = document.getElementById('link-input') as HTMLInputElement;
		if (link_input_e) {
			link_input_e.focus();
		}
	});

	async function onError(e: string): Promise<void> {
		console.log(e);
	}

	async function onFormSubmit(): Promise<void> {
		if (link_input.length == 0 || !validate_url(link_input)) {
			return;
		}
		if (expiry_input == '') {
			return;
		}

		loading = true;

		if (turnstile_token.length == 0) {
			turnstile_validation = true;
			return;
		}

		await shorten(link_input, expiry_input, turnstile_token, turnstile_type);

		turnstile_token = '';
		turnstile_type = '';

		loading = false;
	}

	async function shorten(
		url: string,
		expiry: string,
		turnstile_token: string,
		turnstile_type: string
	): Promise<void> {
		const response = await fetch('/api/create', {
			method: 'POST',
			body: JSON.stringify({
				url: url,
				expiry: expiry,
				turnstile_token: turnstile_token,
				turnstile_type: turnstile_type
			}),
			headers: {
				'content-type': 'application/json'
			}
		});

		const data = await response.text();
		console.log(data);
	}

	async function onTurnstileVisiblePass(e: CustomEvent): Promise<void> {
		turnstile_requires_interaction = false;
		const data = e.detail as { token: string };
		turnstile_token = data.token;
		turnstile_type = 'visible';
		turnstile_validation = false;
		await onFormSubmit();
	}

	async function onTurnstileInvisiblePass(e: CustomEvent): Promise<void> {
		const data = e.detail as { token: string };
		turnstile_token = data.token;
		turnstile_type = 'invisible';
		turnstile_validation = false;
		await onFormSubmit();
	}

	async function onTurnstileInvisibleFail(e: CustomEvent): Promise<void> {
		turnstile_requires_interaction = true;
	}

	$: {
		link_input = link_input.trim();

		let url_valid = validate_url(link_input);

		if (browser) {
			let link_input_e = document.getElementById('link-input') as HTMLInputElement;
			if (link_input_e) {
				link_invalid = !url_valid && link_input.length > 0;
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
			id="link-form"
			novalidate
			on:submit|preventDefault={onFormSubmit}
		>
			<!-- Link Input Row-->
			<div class="w-full">
				<label for="link-input" class="text-sm text-zinc-500 pl-2">
					What's the link you want to shorten?
				</label>
				<input
					class="w-full font-medium placeholder-zinc-400
					{loaded ? (link_invalid ? 'ring-red-500/50' : 'ring-sky-500/50') : 'ring ring-sky-500/50'}
					{loaded ? (link_invalid ? 'border-red-500' : 'border-zinc-400') : 'border-sky-500'}
					{link_invalid ? 'focus:border-red-500' : 'focus:border-sky-500'}
					border-2 py-2 px-4 my-0.5 rounded-lg focus:outline-none focus:ring motion-safe:transition-all"
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
				<div class="flex mt-0.5 items-center">
					<div class="grow h-full grid grid-cols-6">
						<div class="flex">
							<input
								id="expiry10m"
								type="radio"
								name="expiry"
								value="10m"
								class="w-0 peer"
								aria-labelledby="expiry10mLabel"
								bind:group={expiry_input}
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
								bind:group={expiry_input}
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
								bind:group={expiry_input}
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
								bind:group={expiry_input}
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
								bind:group={expiry_input}
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
								id="expiry10y"
								type="radio"
								name="expiry"
								value="10y"
								class="w-0 peer"
								aria-hidden="true"
								aria-labelledby="expiry10yLabel"
								bind:group={expiry_input}
							/>
							<label
								id="expiry10yLabel"
								for="expiry10y"
								class="grow border-2 border-l border-l-zinc-300 border-zinc-400 py-3 px-3 bg-white rounded-r-md peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-600 peer-focus-visible:border-black peer-focus-visible:border-l-2 peer-focus-visible:ring-black"
							>
								10 years
							</label>
						</div>
					</div>
					<div
						class="col-span-2 {turnstile_requires_interaction && loading
							? 'ml-6'
							: 'ml-12'} text-white min-w-[11rem]"
					>
						{#if turnstile_requires_interaction}
							<div class="">
								<Turnstile
									on:turnstile-callback={onTurnstileVisiblePass}
									siteKey={PUBLIC_TURNSTILE_VISIBLE_KEY}
									theme="light"
								/>
							</div>
						{:else}
							<button
								type="submit"
								class="h-full min-w-[11rem] bg-clip-border border-2 border-transparent py-3 rounded-md motion-reduce:enabled:bg-sky-500 blue-gradient motion-safe:disabled:transition-transform motion-safe:enabled:transition-all motion-safe:enabled:hover:shadow-lg motion-safe:enabled:hover:scale-105 motion-safe:enabled:hover:shadow-sky-500/50 motion-safe:enabled:active:scale-100 disabled:bg-slate-400"
								disabled={loading}
							>
								{loading ? 'Loading...' : 'Coming Soon!'}
							</button>
						{/if}
					</div>
					{#if turnstile_validation}
						<Turnstile
							on:turnstile-callback={onTurnstileInvisiblePass}
							on:turnstile-error={onTurnstileInvisibleFail}
							siteKey={PUBLIC_TURNSTILE_INVISIBLE_KEY}
							theme="light"
						/>
					{/if}
				</div>
			</div>
		</form>
	</div>
</div>
