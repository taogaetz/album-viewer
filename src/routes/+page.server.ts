import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { albums } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import csv from 'csv-parser';
import { Readable } from 'stream';

export const load: PageServerLoad = async () => {
    const allAlbums = await db.select().from(albums);
    return {
        albums: allAlbums
    };
};

export const actions: Actions = {
    upload: async ({ request }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return fail(400, { error: 'No file uploaded' });
        }

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const results: any[] = [];

            await new Promise((resolve, reject) => {
                const stream = Readable.from(buffer);
                stream
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            // Fetch existing albums for deduplication
            const existingAlbums = await db.select({ title: albums.title, artist: albums.artist }).from(albums);
            const existingSignatures = new Set(
                existingAlbums.map((a) => `${a.title.toLowerCase()}|${a.artist.toLowerCase()}`)
            );

            const dataToInsert = [];
            let skippedCount = 0;

            for (const entry of results) {
                const normalizedEntry: Record<string, any> = {};
                Object.keys(entry).forEach((key) => {
                    const cleanKey = key.trim().replace(/^\ufeff/, '');
                    normalizedEntry[cleanKey] = entry[key];
                });

                if (normalizedEntry.title && normalizedEntry.artist) {
                    const signature = `${normalizedEntry.title.toLowerCase()}|${normalizedEntry.artist.toLowerCase()}`;

                    if (!existingSignatures.has(signature)) {
                        dataToInsert.push({
                            title: normalizedEntry.title,
                            artist: normalizedEntry.artist,
                            platform: normalizedEntry.platform || 'spotify',
                            isFound: normalizedEntry.isFound === '1' ? 1 : 0
                        });
                        // Add to set to handle duplicates within the same CSV
                        existingSignatures.add(signature);
                    } else {
                        skippedCount++;
                    }
                }
            }

            if (dataToInsert.length > 0) {
                await db.insert(albums).values(dataToInsert);
            }

            return { success: true, count: dataToInsert.length, skipped: skippedCount };
        } catch (error) {
            console.error('Upload error:', error);
            return fail(500, { error: 'Failed to process file' });
        }
    }
};
