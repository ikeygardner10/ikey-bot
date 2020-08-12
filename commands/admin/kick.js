const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'kick',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user> <reason (optional)>',
		cooldown: 2,
		category: 'admin',
		permissions: 'Kick Members',
		args: true,
		description: 'Kicks a member, with optional reasons',
	},
	execute: async (client, message, args) => {

		const member = message.mentions.members.first(); if(!member) return message.channel.send('Mention a user.');
		const [, ...restArgs] = args; const reason = restArgs.join(' ');

		const kEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest; const memberrole = member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			if(member.hasPermission(['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER', 'MUTE_MEMBERS'])) return message.channel.send('`Invalid Permission (USER HAS KICK MEMBERS PERMISSIONS`');
			if(authorrole.position < memberrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER THAN YOURS)`');
			if(memberrole.position > botrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER THAN MINE)`');
		}
		if(!message.guild.member(member.user).bannable) return message.channel.send('`Invalid Permission (USER NOT KICKABLE)`');

		return member.kick({ reason: `${reason || 'No reason provided.'}` })
			.then(() => {
				kEmbed.setDescription(`**Result:** ${member} (ID: \`${member.id}\`) has been kicked.\n\n**Kicked By:** <@${message.author.id}>\n**Reason:** ${reason || 'No reason provided.'}`);
				console.success(`[KICK CMD] Kick success\nUser kicked: ${member.user.username}\nKicked by: ${message.member.username}`);
				return message.channel.send(kEmbed);
			})
			.catch((error) => {
				console.error(`[KICK CMD] ${error.stack}`);
				return message.channel.sned(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };