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

		// Define member and user, if ID is given, fetch member and user, redefine
		let member = message.mentions.members.first() || message.member;
		let user = member.user;
		if(args[0] && args[0].match(/^[0-9]{18}$/)) {
			await message.guild.members.fetch(args[0]);
			member = message.guild.members.cache.get(args[0]);
			await client.users.fetch(args[0]);
			user = client.users.cache.get(args[0]);
		}
		const avatar = user.avatarURL({ format: 'png', dynamic: true, size: 1024 });

		const avEmbed = new MessageEmbed()
			.setImage(avatar)
			.setFooter(`${user.tag}'s Avatar`, client.user.avatarURL())
			.setColor('0xFFFFFA');

		return message.channel.send(avEmbed);
	} };