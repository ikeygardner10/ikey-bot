const { getSong, getAlbumArt } = require('genius-lyrics-api');
const getArtistTitle = require('get-artist-title');
const sendEmbed = require('../../functions/sendEmbed');

module.exports = {
	config: {
		name: 'lyrics',
		aliases: ['ly'],
		usage: '<artist> - <song>',
		cooldown: 10,
		category: 'general',
		permissions: '',
		args: true,
		description: 'Display song lyrics',
	},
	execute: async (client, message, args) => {

		let title; let artist;

		if(args[0] === 'np') {
			const user = message.member.user;
			const activities = user.presence.activities;
			const actArray = [];
			activities.forEach(activity => {
				actArray.push(activity);
			});
			const spotifyObj = actArray.find(act => act.name === 'Spotify');
			if(!spotifyObj) return message.lineReply('`Invalid (NOTHING PLAYING)`');
			artist = spotifyObj.state;
			title = spotifyObj.details;
		}
		else {
			try {
				[artist, title] = getArtistTitle(args.join(' '));
			}
			catch(error) {
				console.error(`[LYRICS CMD] ${error.stack}`);
				return message.lineReply('`Invalid (SEARCH FORMAT: \'ARTIST - SONG NAME\')`');
			}
		}

		const options = {
			apiKey: client.config.geniusKey,
			title: title,
			artist: artist,
			optimizeQuery: true,
		};

		const lyricArray = []; let author;
		await getSong(options)
			.then(song => {
				try {
					author = `Lyrics for ${song.title}`;
				}
				catch {
					author = `Lyrics for ${title} by ${artist}`;
				}
				async function createArray(text) {
					await text.replace(/\[.*\]\n?/g, '');
					const arr = text.match(/[\s\S]{1,1024}(?=(\[|$))/g);
					for(const list of arr) {
						lyricArray.push(`[Genius Lyrics](${song.url})\n\n${list}`);
					}
				}
				if(song === null) return message.lineReply('`Invalid (NO SONG FOUND)`');
				const ly = song.lyrics.replace(/\[.*\]?/g, '');
				createArray(song.lyrics);
				const lyArray = ly.split('\n\n');
				console.warn(lyArray[0]);
				lyricArray.forEach(lyric => {
					lyric.replace('-', '\n');
					return lyric;
				});
				return getAlbumArt(options)
					.then(art => {
						return sendEmbed(message, lyricArray, author, 1, ' ', art);
					});
			});

	} };