<script lang="ts">
	import { onMount } from 'svelte';
	import { validate_url } from '$lib/validation';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import { Turnstile } from 'svelte-turnstile';
	import QRCode from 'qrcode';
	import copy from 'copy-to-clipboard';

	import { PUBLIC_TURNSTILE_INVISIBLE_KEY, PUBLIC_TURNSTILE_VISIBLE_KEY } from '$env/static/public';
	import { error } from '@sveltejs/kit';

	export let data: PageData;

	type ShortenData = {
		path: string;
		expiry: Date;
	};

	let loaded = false;

	let link_placeholder = data.link_placeholder;

	let link_input: string = '';
	let expiry_input: string = '1h';
	let turnstile_token: string = '';
	let turnstile_type: string = '';

	let link_invalid: boolean = false;
	let turnstile_requires_interaction: boolean = false;

	let loading: boolean = false;
	let turnstile_validation: boolean = false;
	let shortened: boolean = false;

	let QRData: string =
		'data:image/webp;base64,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';
	let copied: boolean = false;

	let shortened_data: ShortenData = {
		path: 'eg',
		expiry: new Date()
	};

	onMount(() => {
		loaded = true;

		let link_input_e = document.getElementById('link-input') as HTMLInputElement;
		if (link_input_e) {
			link_input_e.focus();
		}
	});

	async function onError(e: string): Promise<void> {
		alert(e);
	}

	async function onFormSubmit(): Promise<void> {
		document.getElementById('main')?.scrollIntoView({
			behavior:
				window.matchMedia(`(prefers-reduced-motion: reduce)`)?.matches === true ? 'auto' : 'smooth'
		});

		setTimeout(() => {
			shortened = false;
		}, 500);

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

		let shortened_response: ShortenData;

		try {
			shortened_response = await shorten(link_input, expiry_input, turnstile_token, turnstile_type);
		} catch (e) {
			turnstile_token = '';
			turnstile_type = '';
			loading = false;
			return;
		}
		console.log(data);

		QRData = await QRCode.toDataURL(`https://its.obl.ong/${shortened_response.path}`, {
			type: 'image/webp',
			scale: 50
		});

		turnstile_token = '';
		turnstile_type = '';

		shortened = true;
		shortened_data = shortened_response;

		setTimeout(() => {
			document.getElementById('shortened')?.scrollIntoView({
				behavior:
					window.matchMedia(`(prefers-reduced-motion: reduce)`)?.matches === true
						? 'auto'
						: 'smooth'
			});

			setTimeout(() => {
				loading = false;
				link_input = '';
				expiry_input = '1h';
			}, 250);
		}, 100);
	}

	async function shorten(
		url: string,
		expiry: string,
		turnstile_token: string,
		turnstile_type: string
	): Promise<ShortenData> {
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

		if (!response.ok) {
			onError('There was an internal error, we failed to shorten your link. Try again later.');
			throw error(
				500,
				'There was an internal error, we failed to shorten your link. Try again later.'
			);
		}

		let data = await response.json();
		data.expiry = new Date(data.expiry);
		return data;
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

	async function onShortenedClick(event: MouseEvent): Promise<void> {
		copy(`https://its.obl.ong/${shortened_data.path}`);
		copied = true;

		setTimeout(() => {
			copied = false;
		}, 5000);
	}

	async function onDownloadClick(event: MouseEvent): Promise<void> {
		const a = document.createElement('a');
		a.href = QRData;
		a.target = '_self';
		a.download = `its.obl.ong-${shortened_data.path}.webp`;
		a.click();
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

<div id="main" class="min-h-screen flex justify-center flex-col py-16">
	<!-- Hero -->
	<div class="pb-20 flex flex-col text-center px-8">
		<p
			class="bg-white mx-auto text-md font-medium text-zinc-700 border-2 border-zinc-200 rounded-full py-1 px-5"
		>
			Its.obl.ong just launched! 🚀
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
								class="h-full min-w-[11rem] bg-clip-border border-2 border-transparent motion-reduce:enabled:border-sky-500 py-3 rounded-md motion-reduce:enabled:bg-sky-500 blue-gradient motion-safe:disabled:transition-transform motion-safe:enabled:transition-all motion-safe:enabled:hover:shadow-lg motion-safe:enabled:hover:scale-105 motion-safe:enabled:hover:shadow-sky-500/50 motion-safe:enabled:active:scale-100 disabled:bg-zinc-400"
								disabled={loading}
							>
								{loading ? 'Loading...' : 'Shorten it'}
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

{#if shortened}
	<div id="shortened" class="py-10 text-center">
		<div class="py-4">
			<div class="py-2">
				<h2 class="text-xl font-medium text-zinc-800">Here's your shortened link</h2>
			</div>
			<button class="py-2" on:click={onShortenedClick} aria-roledescription="copyURL">
				<p class="text-3xl font-bold py-1">
					https://its.obl.ong/<span
						class="bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent"
					>
						{shortened_data.path}
					</span>
				</p>
				<p class="text-sm text-zinc-500">
					{copied ? 'Copied to clipboard' : 'Click to copy to clipboard'}
				</p>
			</button>
		</div>
		<div class="w-full flex flex-col justify-center">
			<img
				src={QRData}
				alt="QR code for https://its.obl.ong/{shortened_data.path}"
				class="w-[30rem] h-[30rem] mx-auto"
			/>
			<button
				class="bg-sky-500 mx-auto px-8 py-3 rounded-md text-white font-medium motion-reduce:active:bg-sky-600 motion-safe:hover:scale-105 motion-safe:active:scale-100 motion-safe:transition-all motion-safe:hover:shadow-lg motion-safe:hover:shadow-sky-500/50"
				on:click={onDownloadClick}
			>
				Save QR code
			</button>
		</div>
	</div>
{/if}
