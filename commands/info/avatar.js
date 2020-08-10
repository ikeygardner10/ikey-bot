/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'avatar',
		aliases: ['av', 'pfp', 'dp'],
		usage: '<@user (optional)>',
		cooldown: 5,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Displays user avatar',
	},
	execute: async (client, message, args) => {

		const user = message.mentions.users.first() || message.author;
		const avatar = user.avatarURL({ format: 'png', dynamic: true, size: 1024 });

		const avEmbed = new MessageEmbed()
			.setImage(avatar)
			.setFooter(`${user.tag}'s Avatar`, client.user.avatarURL())
			.setColor('0xFFFFFA');

		return message.channel.send(avEmbed);
	} };