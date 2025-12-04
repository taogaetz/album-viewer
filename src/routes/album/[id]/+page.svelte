<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    function formatDuration(ms: number | undefined): string {
        if (!ms) return "";
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
</script>

<div class="max-w-4xl mx-auto p-8">
    <a
        href="/"
        class="inline-block mb-8 text-blue-500 no-underline font-medium hover:underline"
    >
        ← Back to Albums
    </a>

    {#await data.musicbrainz}
        <!-- Loading state -->
        <div class="flex gap-8 mb-12 max-md:flex-col">
            {#if data.album.coverArtUrl}
                <img
                    src={data.album.coverArtUrl}
                    alt="{data.album.title} cover art"
                    class="w-[300px] h-[300px] object-cover rounded-lg shadow-xl max-md:w-full max-md:max-w-[300px] max-md:mx-auto"
                />
            {:else}
                <div
                    class="w-[300px] h-[300px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-xl max-md:w-full max-md:max-w-[300px] max-md:mx-auto"
                >
                    <span>No Cover Art</span>
                </div>
            {/if}

            <div class="flex-1">
                <h1 class="text-4xl font-bold mb-2 leading-tight">
                    {data.album.title}
                </h1>
                <h2 class="text-2xl text-gray-600 mb-6">{data.album.artist}</h2>

                <div class="flex items-center gap-4">
                    <div
                        class="w-6 h-6 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"
                    ></div>
                    <p class="text-gray-600 italic m-0">
                        Loading album details...
                    </p>
                </div>
            </div>
        </div>
    {:then musicbrainz}
        <!-- Data loaded -->
        <div class="flex gap-8 mb-12 max-md:flex-col">
            {#if musicbrainz?.coverArtUrl}
                <img
                    src={musicbrainz.coverArtUrl}
                    alt="{data.album.title} cover art"
                    class="w-[300px] h-[300px] object-cover rounded-lg shadow-xl max-md:w-full max-md:max-w-[300px] max-md:mx-auto"
                />
            {:else if data.album.coverArtUrl}
                <img
                    src={data.album.coverArtUrl}
                    alt="{data.album.title} cover art"
                    class="w-[300px] h-[300px] object-cover rounded-lg shadow-xl max-md:w-full max-md:max-w-[300px] max-md:mx-auto"
                />
            {:else}
                <div
                    class="w-[300px] h-[300px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold shadow-xl max-md:w-full max-md:max-w-[300px] max-md:mx-auto"
                >
                    <span>No Cover Art</span>
                </div>
            {/if}

            <div class="flex-1">
                <h1
                    class="text-4xl font-bold mb-2 leading-tight max-md:text-3xl"
                >
                    {data.album.title}
                </h1>
                <h2 class="text-2xl text-gray-600 mb-6">{data.album.artist}</h2>

                {#if musicbrainz}
                    <div class="flex flex-col gap-2">
                        {#if musicbrainz.releaseDate}
                            <p class="m-0 text-base leading-relaxed">
                                <strong class="text-gray-800"
                                    >Release Date:</strong
                                >
                                {musicbrainz.releaseDate}
                            </p>
                        {/if}
                        {#if musicbrainz.label}
                            <p class="m-0 text-base leading-relaxed">
                                <strong class="text-gray-800">Label:</strong>
                                {musicbrainz.label}
                            </p>
                        {/if}
                        {#if musicbrainz.trackCount}
                            <p class="m-0 text-base leading-relaxed">
                                <strong class="text-gray-800">Tracks:</strong>
                                {musicbrainz.trackCount}
                            </p>
                        {/if}
                        <p class="m-0 text-base leading-relaxed">
                            <strong class="text-gray-800">Platform:</strong>
                            {data.album.platform}
                        </p>
                    </div>
                {:else}
                    <div class="flex flex-col gap-2">
                        <p class="m-0 text-base leading-relaxed">
                            <strong class="text-gray-800">Platform:</strong>
                            {data.album.platform}
                        </p>
                        <p class="text-gray-400 italic m-0">
                            MusicBrainz metadata not available
                        </p>
                    </div>
                {/if}
            </div>
        </div>

        {#if musicbrainz?.tracks && musicbrainz.tracks.length > 0}
            <div class="bg-gray-50 rounded-lg p-8">
                <h3 class="text-2xl font-bold mb-4">Track Listing</h3>
                <ol class="m-0 pl-6 list-outside">
                    {#each musicbrainz.tracks as track}
                        <li
                            class="flex justify-between py-3 border-b border-gray-200 last:border-b-0"
                        >
                            <span class="flex-1">{track.title}</span>
                            {#if track.length}
                                <span class="text-gray-600 tabular-nums">
                                    {formatDuration(track.length)}
                                </span>
                            {/if}
                        </li>
                    {/each}
                </ol>
            </div>
        {/if}
    {/await}
</div>
