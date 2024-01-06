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
	let shortened: boolean = true;

	let QRData: string =
		'data:image/webp;base64,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';
	let copied: boolean = false;

	let shortened_data: ShortenData = {
		path: '1',
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

	const expiry_selector_styles =
		'flex border-2 sm:border-t-2 sm:border-b-2 sm:border-l sm:border-r sm:first:border-l-2 sm:first:border-r sm:first:border-l-zinc-400 border-r-2 sm:last:border-r-2 sm:last:border-r-zinc-400 border-zinc-400 sm:border-l-zinc-300 sm:border-r-zinc-300 -sm:rounded-md sm:first:rounded-l-md sm:last:rounded-r-md overflow-hidden bg-white has-[:checked]:bg-sky-500 has-[:checked]:text-white has-[:checked]:border-sky-600 has-[:focus-visible]:border-black has-[:focus-visible]:border-r-2 has-[:focus-visible]:border-l-2 has-[:focus-visible]:ring-black';
</script>

<noscript>
	<meta http-equiv="refresh" content="0; url=/noscript" />
</noscript>

<div id="main" class="min-h-screen flex justify-center flex-col py-8 sm:py-12 md:py-16">
	<!-- Hero -->
	<div class="pb-10 md:pb-20 flex flex-col text-center px-4 md:px-8">
		<p
			class="bg-white mx-auto text-md font-medium text-zinc-700 border-2 border-zinc-200 rounded-full py-1 px-5"
		>
			Now works on mobile! 📱
		</p>
		<div class="flex mx-auto text-5xl md:text-6xl font-bold py-6">
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
		<p class="text-center text-zinc-800 text-md md:text-lg py-4 font-medium">
			Its.obl.ong is the best way to create super short links that can be shared anywhere.<br
			/>Completely free, popups-less, no sign-ups, and zero ads. It just works.
		</p>
	</div>

	<!-- Form -->
	<div class="flex justify-center">
		<form
			class="grow flex flex-col space-y-6 justify-center max-w-4xl mx-4"
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
					border-2 py-2 px-4 my-0.5 rounded-lg focus:outline-none focus:ring motion-safe:transition-all overflow-ellipsis"
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
				<div class="flex mt-0.5 items-center flex-col md:flex-row space-y-8 md:space-y-0">
					<div
						class="grow h-full grid grid-cols-3 sm:grid-cols-6 w-full gap-x-3 gap-y-2 sm:gap-x-0 sm:gap-y-0"
					>
						<div class={expiry_selector_styles}>
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
							<label id="expiry10mLabel" for="expiry10m" class="grow py-1 sm:py-3 px-3">
								10 min
							</label>
						</div>
						<div class={expiry_selector_styles}>
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
							<label id="expiry1hLabel" for="expiry1h" class="grow py-1 sm:py-3 px-3">
								1 hour
							</label>
						</div>
						<div class={expiry_selector_styles}>
							<input
								id="expiry1d"
								type="radio"
								name="expiry"
								value="1d"
								class="w-0 peer"
								aria-labelledby="expiry1dLabel"
								bind:group={expiry_input}
							/>
							<label id="expiry1dLabel" for="expiry1d" class="grow py-1 sm:py-3 px-3">
								1 day
							</label>
						</div>
						<div class={expiry_selector_styles}>
							<input
								id="expiry1M"
								type="radio"
								name="expiry"
								value="1M"
								class="w-0 peer"
								aria-labelledby="expiry1MLabel"
								bind:group={expiry_input}
							/>
							<label id="expiry1MLabel" for="expiry1M" class="grow py-1 sm:py-3 px-3">
								1 month
							</label>
						</div>
						<div class={expiry_selector_styles}>
							<input
								id="expiry1y"
								type="radio"
								name="expiry"
								value="1y"
								class="w-0 peer"
								aria-labelledby="expiry1yLabel"
								bind:group={expiry_input}
							/>
							<label id="expiry1yLabel" for="expiry1y" class="grow py-1 sm:py-3 px-3">
								1 year
							</label>
						</div>
						<div class={expiry_selector_styles}>
							<input
								id="expiry10y"
								type="radio"
								name="expiry"
								value="10y"
								class="w-0 peer"
								aria-labelledby="expiry10yLabel"
								bind:group={expiry_input}
							/>
							<label id="expiry10yLabel" for="expiry10y" class="grow py-1 sm:py-3 px-3">
								10 years
							</label>
						</div>
					</div>
					<div
						class="col-span-2 {turnstile_requires_interaction && loading
							? 'md:ml-6'
							: 'md:ml-12'} text-white min-w-[11rem] md:grow-0 grow w-full md:w-auto"
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
								class="w-full md:w-auto h-full min-w-[11rem] bg-clip-border border-2 border-transparent motion-reduce:enabled:border-sky-500 py-2 sm:py-3 rounded-md motion-reduce:enabled:bg-sky-500 blue-gradient motion-safe:disabled:transition-transform motion-safe:enabled:transition-all motion-safe:enabled:hover:shadow-lg motion-safe:enabled:hover:scale-105 motion-safe:enabled:hover:shadow-sky-500/50 motion-safe:enabled:active:scale-100 disabled:bg-zinc-400"
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
	<div id="shortened" class="py-4 sm:py-10 text-center">
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
		<div class="w-full flex flex-col justify-center max-w-[30rem] mx-auto">
			<img
				src={QRData}
				alt="QR code for https://its.obl.ong/{shortened_data.path}"
				class="mx-auto object-contain"
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
