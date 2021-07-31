const { MessageEmbed } = require('discord.js');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'unmute',
		aliases: ['um'],
		usage: '<@user>',
		cooldown: 5,
		category: 'admin',
		permissions: 'Mute Members',
		args: true,
		description: 'Unmutes a member',
	},
	execute: async (client, message, args) => {

		const member = message.guild.member(await getMember(message, args));
		if(!member) return message.lineReply('`Invalid (MENTION USER/USER ID)`');

		const role = message.guild.roles.cache.find(r => r.name === 'Muted');
		if(!role) return message.lineReply('`Invalid (NO MUTED ROLE)`');

		const uEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		if(!member.roles.cache.has(role.id)) return message.lineReply('`Invalid (USER NOT MUTED)`');

		if(member.roles.cache.has(role.id)) {
			await member.roles.remove(role.id)
				.then(() => {
					uEmbed.setDescription(`**Result:** ${member} has been unmuted.\n\n**Unmuted By:** <@${message.author.id}>`);
					return message.lineReply(uEmbed);
				})
				.catch((error) => {
					console.error(`[UNMUTE CMD] ${error.stack}`);
					return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
		else {
			uEmbed.setDescription(`**Result:** I could not unmute ${member}.\n\n**Reason:** No muted member was found.\nAre they already unmuted?\nDo I have sufficient permissions?`);
			return message.lineReply(uEmbed);
		}

	} };