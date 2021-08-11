const sendEmbed = require('../../functions/sendEmbed');
const { getSong } = require('../../functions/lyricSearch');


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
				const input = args.join(' ');
				if(!input.match(/([\s\w]*)(\s-\s)([\s\w]*)/)) return message.lineReply('`Invalid (SEARCH FORMAT: ARTIST - SONG NAME)`');
				const array = input.split(/\s-\s/);
				if(array.length !== 2) return message.lineReply('`Invalid (SEARCH FORMAT: ARTIST - SONG NAME)`');
				[artist, title] = [array[0], array[1]];
			}
			catch(error) {
				console.error(`[LYRICS CMD] ${error.stack}`);
				return message.lineReply('`Invalid (SEARCH FORMAT: ARTIST - SONG NAME)`');
			}
		}

		const parameters = {
			apiKey: client.config.geniusKey,
			title: title,
			artist: artist,
			optimizeQuery: true,
		};

		const lyricArray = []; let author;
		await getSong(parameters)
			.then(async song => {
				if(song === null) return message.lineReply('`Invalid (NO LYRICS FOUND)`');
				author = `Lyrics for ${song.title}`;
				async function createArray(text) {
					await text.replace(/\[.*\]\n?/g, '');
					const arr = text.match(/[\s\S]{1,2048}(?=(\[|$))/g);
					for(const list of arr) {
						lyricArray.push(`[Genius Lyrics](${song.url})\n\n${list}`);
					}
				}
				if(song === null) return message.lineReply('`Invalid (NO SONG FOUND)`');
				await createArray(song.lyrics);
				lyricArray.forEach(lyric => {
					lyric.replace('-', '\n');
					return lyric;
				});
				return sendEmbed(message, lyricArray, author, 1, ' ', song.albumArt);
			});

	} };