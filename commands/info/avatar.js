/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const getMember = require('../../functions/getMember');

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

		// Define member and user, if ID is given, fetch member and user, redefine
		const member = await getMember(message, args);
		const user = member.user;
		const avatar = user.avatarURL({ format: 'png', dynamic: true, size: 1024 });

		const avEmbed = new MessageEmbed()
			.setImage(avatar)
			.setFooter(`${user.tag}'s Avatar`, client.user.avatarURL())
			.setColor('0xFFFFFA');

		return message.lineReply(avEmbed);
	} };