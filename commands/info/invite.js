/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'invite',
		aliases: ['inv'],
		usage: '',
		cooldown: 10,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Sends user a bot server invite',
	},
	execute: async (client, message, args) => {

		const iEmbed = new MessageEmbed()
			.setAuthor(`${client.user.username}`, client.user.avatarURL())
			.setDescription('**Invite:** [Link](https://discord.com/api/oauth2/authorize?client_id=607091388588359687&permissions=1544027255&scope=bot)')
			.setTimestamp()
			.setColor('0xFFFFFA');

		try {
			await message.author.send(iEmbed);
			return message.channel.send('`Incoming DM`');
		} catch(error) {
			console.error(`[INVITE CMD] ${error.stack}`);
			return message.channel.send('Could not send DM, do you have messages open?');
		}
	} };
