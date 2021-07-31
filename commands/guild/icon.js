/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'icon',
		aliases: ['ic'],
		usage: '',
		cooldown: 10,
		category: 'guild',
		permissions: '',
		args: false,
		description: 'Displays server icon',
	},
	execute: async (client, message, args) => {

		// Create embed
		const iEmbed = new MessageEmbed()
			.setImage(message.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }))
			.setFooter(`${message.guild.name}'s Icon`, client.user.avatarURL())
			.setColor(0xFFFFFA);

		// Return embed
		return message.lineReply(iEmbed);

	} };