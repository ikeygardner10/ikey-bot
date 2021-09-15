const ytdl = require('ytdl-core');

module.exports = {
	config: {
		name: 'start',
		aliases: ['play'],
		usage: 'youtube-link',
		cooldown: 3,
		category: 'music',
		permissions: 'None',
		args: false,
		description: '',
	},
	execute: async (client, message, args) => {

        return;

		const voiceChannel = message.member.voice.channel;
		if(!voiceChannel) return message.lineReply('`Invalid (MUST BE IN VOICE CHANNEL)`');

		const perms = voiceChannel.permissionsFor(message.client.user);
		if(!perms.has('CONNECT') || !perms.has('SPEAK')) return message.lineReply('`Invalid (MISSING JOIN/SPEAK PERMISSIONS`');

		const serverQueue = client.queue.get(message.guild.id);

		const link = args.join('');
		if(!link) return message.lineReply('`Invalid (NO YOUTUBE LINK)`');
		if(!link.match(/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)&?/)) return message.lineReply('`Invalid (NOT A VALID YOUTUBE LINK)`');

		const songInfo = await ytdl.getInfo(link);
		const track = {
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url,
		};

		function play(guild, queue, song) {

			const dispatcher = queue.connection
				.play(ytdl(song.url))
				.on('finish', () => {
					queue.songs.shift();
					play(guild, queue.songs[0]);
				})
				.on('error', error => console.error(error.stack));
			dispatcher.setVolumeLogarithmic(queue.volume / 5);
			queue.textChannel.send(`Start playing: **${song.title}**`);
		}

		if(!serverQueue) {

			const queueContract = {
				textChannel: message.channel,
				voiceChannel: voiceChannel,
				connection: null,
				songs: [],
				volume: 5,
				playing: true,
			};

			await client.queue.set(message.guild.id, queueContract);
			queueContract.songs.push(track);

			try {

				const connection = await voiceChannel.join();
				queueContract.connection = connection;
				play(message.guild, serverQueue, queueContract.songs[0]);

			}
			catch(error) {

				console.error(`[START CMD] ${error.stack}`);
				client.queue.delete(message.guild.id);
				return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);

			}

		}
		else {
			serverQueue.songs.push(track);
			console.success(`[START CMD] Link ${track.url} successfully added to queue for guild: ${message.guild.id}`);
			return message.lineReply(`**[${track.title}](${track.url})** added to the queue.`);
		}

	} };