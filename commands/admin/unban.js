const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'unban',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<username/ID>',
		cooldown: 5,
		category: 'admin',
		permissions: 'Ban Members',
		args: true,
		description: 'Unbans a user',
	},
	execute: async (client, message, args) => {

		const member = args.join(' ');
		if(!member) return message.lineReply('`Invalid (USERNAME/USER ID)`');

		const uEmbed = new MessageEmbed()
			.setThumbnail(client.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		message.guild.fetchBans()
			.then(bans => {
				if(bans.some(u => member.includes(u.user.username))) {
					const user = bans.find(u => u.user.username === member);
					message.guild.members.unban(user.user.id)
						.then(() => {
							uEmbed.setDescription(`**Result:** <@${user.user.id}> has been unbanned.\n\n**Unbanned by:** <@${message.author.id}>`);
							return message.lineReply(uEmbed);
						})
						.catch((error) => {
							console.error(`[UNBAN CMD] ${error.stack}`);
							return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
						});
					return;
				}
				else if(bans.some(u => member.includes(u.user.id))) {
					message.guild.members.unban(member)
						.then(() => {
							uEmbed.setDescription(`**Result:** <@${member}> has been unbanned.\n\n**Unbanned by:** <@${message.author.id}>`);
							return message.lineReply(uEmbed);
						})
						.catch((error) => {
							console.error(`[UNBAN CMD] ${error.stack}`);
							return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
						});
					return;
				}
				else {
					uEmbed.setDescription('**Result:** I could not unban ${member}.\n\n**Reason:** No banned member was found.\nAre they already unbanned?\nDo I have sufficient permissions?');
					return message.lineReply(uEmbed);
				}
			}).catch();
	} };