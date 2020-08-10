const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'sad',
		aliases: ['rape'],
		usage: '',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: '',
	},
	execute: async (client, message) => {

		const rEmbed = new MessageEmbed()
			.setColor(0xFFFFFA)
			.setTimestamp()
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL());

		rEmbed.setDescription('**Feature Removed**\n\nDue to the new bot verification process, certain features that weren\'t TOS friendly had to be removed (this is the only feature removed that will affect users).\n\nPart of the verification process is to verify myself as a developer and I become liable for legal stuff, data retention, as well as "encouraging" illegal behaviour.\n\n**Note:**\n***Some*** of the old code still exists, attached to a new bot user account.\nI do not condone or encourage you to use that version as it has been largely stripped and is deprecated, however it does still exist: ');
		return message.channel.send(rEmbed);
	} };