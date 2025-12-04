import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	age: integer('age')
});

export const albums = sqliteTable('albums', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	artist: text('artist').notNull(),
	platform: text('platform').notNull(),
	isFound: integer('isFound').notNull(),
	mbid: text('mbid'), // MusicBrainz ID
	coverArtUrl: text('coverArtUrl'), // Cover art URL from Cover Art Archive
	musicbrainzData: text('musicbrainzData', { mode: 'json' }) // Full MusicBrainz metadata as JSON
});

