<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import { toast } from 'svelte-sonner';

	let { form, data }: { form: ActionData; data: PageData } = $props();

	let name = $state(form?.name || '');
	let description = $state(form?.description || '');
	let imageUrl = $state(form?.imageUrl || '');
	let price = $state(form?.price || '');
	let type = $state(form?.type || 'digital');

	$effect(() => {
		if (form?.success) {
			// Clear form on success
			name = '';
			description = '';
			imageUrl = '';
			price = '';
			type = 'digital';
			
			toast.success('Item created successfully!', {
				duration: 3000,
			});
		}
		if (form?.error) {
			toast.error(`Error: ${form.error}`, {
				duration: 5000,
			});
		}
	})
</script>

<svelte:head>
	<title>Add New Item - Admin</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="mx-auto max-w-2xl p-6">
		<div class="mb-6">
			<h1 class="text-3xl font-bold text-gray-900">Add New Shop Item</h1>
			<p class="mt-2 text-gray-600">Create a new item for the shop</p>
		</div>

		<div class="rounded-lg bg-card p-6 shadow-sm border">
			<form method="POST" use:enhance class="space-y-6">
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
						Item Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						bind:value={name}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						placeholder="Enter item name"
					/>
				</div>

				<div>
					<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						id="description"
						name="description"
						rows="4"
						bind:value={description}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						placeholder="Describe the item"
					></textarea>
				</div>

				<div>
					<label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">
						Image URL
					</label>
					<input
						type="url"
						id="imageUrl"
						name="imageUrl"
						bind:value={imageUrl}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						placeholder="https://example.com/image.jpg"
					/>
					{#if imageUrl}
						<div class="mt-2">
							<img 
								src={imageUrl} 
								alt="Preview" 
								class="h-32 w-32 rounded-md object-cover border border-gray-200"
								on:error={() => imageUrl = ''}
							/>
						</div>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="price" class="block text-sm font-medium text-gray-700 mb-2">
							Price (tokens)
						</label>
						<input
							type="number"
							id="price"
							name="price"
							bind:value={price}
							required
							min="1"
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							placeholder="10"
						/>
					</div>

					<div>
						<label for="type" class="block text-sm font-medium text-gray-700 mb-2">
							Type
						</label>
						<select
							id="type"
							name="type"
							bind:value={type}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						>
							<option value="digital">Digital</option>
							<option value="physical">Physical</option>
						</select>
					</div>
				</div>

				<div class="flex justify-between pt-6">
					<a
						href="/admin"
						class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						Cancel
					</a>
					<button
						type="submit"
						class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						Create Item
					</button>
				</div>
			</form>
		</div>
	</div>
</div>