/* eslint-disable no-inline-comments */
/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'spotify',
		aliases: ['s'],
		usage: '<@user (optional)>',
		cooldown: 10,
		category: 'general',
		permissions: '',
		args: false,
		description: 'Display currently playing song',
	},
	execute: async (client, message, args) => {

		const member = message.mentions.members.first() || message.member; const user = member.user;
		const activities = user.presence.activities; const actArray = [];

		await activities.forEach(activity => {
			actArray.push(activity);
		});

		const spotifyObj = await actArray.find(act => act.name === 'Spotify');

		if(!spotifyObj) return message.channel.send('`Invalid (NOTHING PLAYING)`');

		const trackIMG = `https://i.scdn.co/image/${spotifyObj.assets.largeImage.slice(8)}`;
		const trackURL = `https://open.spotify.com/track/${spotifyObj.syncID}`;
		const trackName = spotifyObj.details;
		const trackAuthor = spotifyObj.state;
		const trackAlbum = spotifyObj.assets.largeText;

		const sEmbed = new MessageEmbed()
			.setAuthor('Spotify Track Info', 'https://cdn.discordapp.com/emojis/653135129870336031.png?v=1')
			.setColor(0x1ED760)
			.setThumbnail(trackIMG)
			.setDescription(`**:headphones: Title:** ${trackName}\n**:minidisc: Album:** ${trackAlbum}\n**:performing_arts: Artists:** ${trackAuthor}\n\n**Listen to Track:** [Spotify Link](${trackURL})`)
			.setFooter(message.member.displayName, message.author.displayAvatarURL())
			.setTimestamp();


		return message.channel.send(sEmbed);

	} };