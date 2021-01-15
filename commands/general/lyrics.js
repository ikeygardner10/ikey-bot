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
			if(!spotifyObj) return message.channel.send('`Invalid (NOTHING PLAYING)`');
			artist = spotifyObj.state;
			title = spotifyObj.details;
		} else {
			try {
				[artist, title] = getArtistTitle(args.join(' '));
			} catch(error) {
				console.error(`[LYRICS CMD] ${error.stack}`);
				return message.channel.send('`Invalid (SEARCH FORMAT: \'ARTIST - SONG NAME\')`');
			}
		}

		const options = {
			apiKey: client.config.geniusKey,
			title: title,
			artist: artist,
			optimizeQuery: true,
		};

		const lyricArray = [];
		await getSong(options)
			.then(song => {
				const author = `Lyrics for ${title} by ${artist}`;
				async function createArray(text) {
					const arr = text.match(/[\s\S]{1,1024}(?=(\[|$))/g);
					for(const list of arr) {
						lyricArray.push(list);
					}
				}
				if(song === null) return message.channel.send('`Invalid (NO SONG FOUND)`');
				createArray(song.lyrics);
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