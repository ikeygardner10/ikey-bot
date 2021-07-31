/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'website',
		aliases: ['web'],
		usage: '',
		cooldown: 10,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Link for the website',
	},
	execute: async (client, message, args) => {

		const wEmbed = new MessageEmbed()
			.setAuthor(`${client.user.username}`, client.user.avatarURL())
			.setDescription('**Website:** [Link](https://ikeybot.github.io)')
			.setTimestamp()
			.setColor('0xFFFFFA');

		return message.lineReply(wEmbed);
	} };
