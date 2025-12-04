// MusicBrainz API client with rate limiting and proper User-Agent

const USER_AGENT = 'AlbumViewer/1.0.0 ( taogaetz@example.com )';
const RATE_LIMIT_MS = 1100; // 1.1 seconds to be safe with the 1 req/sec limit

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_MS) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();

    const response = await fetch(url, {
        headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'application/json'
        }
    });

    return response;
}

export interface AlbumSearchResult {
    id: string;
    title: string;
    artist: string;
    releaseDate?: string;
    coverArtUrl?: string;
}

export interface AlbumDetails {
    id: string;
    title: string;
    artist: string;
    releaseDate?: string;
    trackCount?: number;
    label?: string;
    coverArtUrl?: string;
    coverArtThumbnail?: string;
    tracks?: Array<{
        position: number;
        title: string;
        length?: number;
    }>;
}

export async function searchAlbum(title: string, artist: string): Promise<AlbumSearchResult | null> {
    try {
        const query = encodeURIComponent(`release:"${title}" AND artist:"${artist}"`);
        const url = `https://musicbrainz.org/ws/2/release/?query=${query}&fmt=json&limit=1`;

        const response = await rateLimitedFetch(url);

        if (!response.ok) {
            console.error('MusicBrainz search failed:', response.status);
            return null;
        }

        const data = await response.json();

        if (!data.releases || data.releases.length === 0) {
            return null;
        }

        const release = data.releases[0];
        const mbid = release.id;

        // Try to get cover art
        let coverArtUrl: string | undefined;
        try {
            const coverArtResponse = await rateLimitedFetch(
                `https://coverartarchive.org/release/${mbid}/front-250`
            );
            if (coverArtResponse.ok) {
                coverArtUrl = coverArtResponse.url;
            }
        } catch (e) {
            // Cover art not available, that's okay
        }

        return {
            id: mbid,
            title: release.title,
            artist: release['artist-credit']?.[0]?.name || artist,
            releaseDate: release.date,
            coverArtUrl
        };
    } catch (error) {
        console.error('Error searching MusicBrainz:', error);
        return null;
    }
}

export async function getAlbumDetails(mbid: string): Promise<AlbumDetails | null> {
    try {
        const url = `https://musicbrainz.org/ws/2/release/${mbid}?inc=artist-credits+labels+recordings&fmt=json`;

        const response = await rateLimitedFetch(url);

        if (!response.ok) {
            console.error('MusicBrainz details failed:', response.status);
            return null;
        }

        const release = await response.json();

        // Get cover art URLs
        let coverArtUrl: string | undefined;
        let coverArtThumbnail: string | undefined;

        try {
            const coverArtResponse = await fetch(
                `https://coverartarchive.org/release/${mbid}`,
                { headers: { 'User-Agent': USER_AGENT } }
            );

            if (coverArtResponse.ok) {
                const coverArtData = await coverArtResponse.json();
                const frontCover = coverArtData.images?.find((img: any) => img.front);
                if (frontCover) {
                    coverArtUrl = frontCover.image;
                    coverArtThumbnail = frontCover.thumbnails?.small || frontCover.thumbnails?.['250'];
                }
            }
        } catch (e) {
            // Cover art not available
        }

        // Extract track listing
        const tracks = release.media?.[0]?.tracks?.map((track: any, index: number) => ({
            position: index + 1,
            title: track.title,
            length: track.length
        })) || [];

        return {
            id: mbid,
            title: release.title,
            artist: release['artist-credit']?.[0]?.name || 'Unknown Artist',
            releaseDate: release.date,
            trackCount: tracks.length,
            label: release['label-info']?.[0]?.label?.name,
            coverArtUrl,
            coverArtThumbnail,
            tracks
        };
    } catch (error) {
        console.error('Error getting album details:', error);
        return null;
    }
}
