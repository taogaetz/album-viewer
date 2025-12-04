<script lang="ts">
	import { enhance } from "$app/forms";
	import type { PageData, ActionData } from "./$types";

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			const files = e.dataTransfer.files;
			if (fileInput) {
				fileInput.files = files;
				fileInput.form?.requestSubmit();
			}
		}
	}
</script>

<div class="max-w-7xl mx-auto p-8">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-4xl font-bold text-gray-900">Album Viewer</h1>

		<form
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<input
				type="file"
				name="file"
				accept=".csv,.tsv,.txt"
				bind:this={fileInput}
				onchange={(e) => e.currentTarget.form?.requestSubmit()}
				class="hidden"
			/>
			<button
				type="button"
				onclick={() => fileInput.click()}
				class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="w-4 h-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="17 8 12 3 7 8"></polyline>
					<line x1="12" y1="3" x2="12" y2="15"></line>
				</svg>
				Import CSV
			</button>
		</form>
	</div>

	{#if form?.success}
		<p
			class="text-green-700 font-semibold bg-green-100 p-4 rounded-lg mb-8"
		>
			Successfully imported {form.count} albums{form.skipped
				? `, skipped ${form.skipped} duplicates`
				: ""}!
		</p>
	{/if}

	{#if form?.error}
		<p class="text-red-700 font-semibold bg-red-100 p-4 rounded-lg mb-8">
			{form.error}
		</p>
	{/if}

	<div class="album-list">
		<h2 class="text-3xl font-bold mb-6 text-gray-900">
			Albums ({data.albums.length})
		</h2>
		{#if data.albums.length === 0}
			<p class="text-center text-gray-400 text-lg py-12">
				No albums found. Upload a CSV to get started!
			</p>
		{:else}
			<div
				class="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6"
			>
				{#each data.albums as album}
					<a
						href="/album/{album.id}"
						class="bg-white rounded-xl overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col no-underline text-inherit"
					>
						<div
							class="aspect-square overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 relative"
						>
							{#if album.coverArtUrl}
								<img
									src={album.coverArtUrl}
									alt="{album.title} cover"
									class="w-full h-full object-cover block"
								/>
							{:else}
								<div
									class="w-full h-full flex items-center justify-center text-white/80"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										class="w-1/2 h-1/2 opacity-60"
									>
										<circle cx="12" cy="12" r="10"></circle>
										<circle cx="12" cy="12" r="3"></circle>
										<line x1="12" y1="2" x2="12" y2="4"
										></line>
										<line x1="12" y1="20" x2="12" y2="22"
										></line>
										<line
											x1="4.93"
											y1="4.93"
											x2="6.34"
											y2="6.34"
										></line>
										<line
											x1="17.66"
											y1="17.66"
											x2="19.07"
											y2="19.07"
										></line>
									</svg>
								</div>
							{/if}
						</div>
						<div class="p-4 flex-1 flex flex-col">
							<h3
								class="text-base font-semibold mb-1 text-gray-900 leading-snug line-clamp-2"
							>
								{album.title}
							</h3>
							<p
								class="text-sm text-gray-600 mb-3 flex-1 line-clamp-1"
							>
								{album.artist}
							</p>
							<span
								class="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium capitalize self-start"
							>
								{album.platform}
							</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
