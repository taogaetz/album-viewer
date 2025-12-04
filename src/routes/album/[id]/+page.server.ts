import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { albums } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getAlbumDetails, searchAlbum } from '$lib/server/musicbrainz';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const albumId = parseInt(params.id);

    if (isNaN(albumId)) {
        throw error(400, 'Invalid album ID');
    }

    const album = await db.select().from(albums).where(eq(albums.id, albumId)).limit(1);

    if (!album || album.length === 0) {
        throw error(404, 'Album not found');
    }

    const albumData = album[0];

    // If we have cached MusicBrainz data, return it immediately
    if (albumData.musicbrainzData) {
        return {
            album: albumData,
            musicbrainz: Promise.resolve(albumData.musicbrainzData)
        };
    }

    // Return a promise that will stream the data when ready
    const musicbrainzPromise = (async () => {
        try {
            // If we have mbid, just fetch details
            if (albumData.mbid) {
                const mbDetails = await getAlbumDetails(albumData.mbid);

                if (mbDetails) {
                    await db.update(albums)
                        .set({ musicbrainzData: mbDetails as any })
                        .where(eq(albums.id, albumId));
                }

                return mbDetails;
            } else {
                // Otherwise search first, then get details
                const mbSearch = await searchAlbum(albumData.title, albumData.artist);
                if (mbSearch?.id) {
                    const mbDetails = await getAlbumDetails(mbSearch.id);

                    // Update database with all the data
                    if (mbDetails) {
                        await db.update(albums)
                            .set({
                                mbid: mbSearch.id,
                                coverArtUrl: mbSearch.coverArtUrl,
                                musicbrainzData: mbDetails as any
                            })
                            .where(eq(albums.id, albumId));
                    }

                    return mbDetails;
                }
            }

            return null;
        } catch (err) {
            console.error('MusicBrainz fetch error:', err);
            return null;
        }
    })();

    return {
        album: albumData,
        musicbrainz: musicbrainzPromise
    };
};
