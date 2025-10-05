<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let email = '';
	let name = '';
	let loading = false;

	export let form;
</script>

<svelte:head>
	<title>Login - Shop</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Welcome to the Shop
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Enter your email to login or create an account
			</p>
		</div>
		
		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ result }) => {
				loading = false;
				if (result.type === 'redirect') {
					goto(result.location);
				}
			};
		}} class="mt-8 space-y-6">
			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="email" class="sr-only">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						bind:value={email}
						class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Email address"
					/>
				</div>
				<div>
					<label for="name" class="sr-only">Name (optional)</label>
					<input
						id="name"
						name="name"
						type="text"
						bind:value={name}
						class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Your name (optional)"
					/>
				</div>
			</div>

			{#if form?.error}
				<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
					{form.error}
				</div>
			{/if}

			<div>
				<button
					type="submit"
					disabled={loading || !email}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if loading}
						<span class="absolute left-0 inset-y-0 flex items-center pl-3">
							<svg class="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</span>
						Logging in...
					{:else}
						Continue to Shop
					{/if}
				</button>
			</div>

			<div class="text-center">
				<p class="text-xs text-gray-500">
					New users will automatically get an account with 0 tokens to start.
				</p>
			</div>
		</form>
	</div>
</div>