const { MessageEmbed } = require('discord.js');

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
	execute: async (client, message) => {

		const member = message.guild.member(message.mentions.members.first()); if(!member) return message.channel.send('Mention a user.');

		const role = message.guild.roles.cache.find(r => r.name === 'Muted');
		if(!role) return message.channel.send('No Muted role found.');

		const uEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		if(!member.roles.cache.has(role.id)) return message.channel.send('`Invalid (USER NOT MUTED)`');

		if(member.roles.cache.has(role.id)) {
			await member.roles.remove(role.id)
				.then(() => {
					uEmbed.setDescription(`**Result:** ${member} has been unmuted.\n\n**Unmuted By:** <@${message.author.id}>`);
					return message.channel.send(uEmbed);
				})
				.catch((error) => {
					console.error(`[UNMUTE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else {
			uEmbed.setDescription(`**Result:** I could not unmute ${member}.\n\n**Reason:** No muted member was found.\nAre they already unmuted?\nDo I have sufficient permissions?`);
			return message.channel.send(uEmbed);
		}

	} };