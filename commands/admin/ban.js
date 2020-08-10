const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'ban',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user> <reason (optional)>/list',
		cooldown: 2,
		category: 'admin',
		permissions: 'Ban Members',
		args: true,
		description: '\nBans a member, with optional reasons\nOr view a list of banned members',
	},
	execute: async (client, message, args) => {

		if(args[0] === 'list') {
			return message.guild.fetchBans()
				.then(banned => {
					const list = banned.map(user => user.user.tag).join('\n');
					if(!list) return message.channel.send('`Invalid (NO BANNED USERS)`');
					return message.channel.send(`**${banned.size} user(s) are banned:**\n${list}`, { split: true });
				}).catch((error) => {
					console.error(`[BAN CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}

		const member = message.mentions.members.first(); if(!member) return message.channel.send('`Invalid (MENTION USER)`');
		const [, ...restArgs] = args; const reason = restArgs.join(' ');

		const bEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		const authorrole = message.member.roles.highest; const memberrole = member.roles.highest;
		const botrole = message.guild.me.roles.highest;
		if(member.hasPermission(['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER', 'MUTE_MEMBERS'])) return message.channel.send('`Invalid Permission (USER HAS ADMIN/MOD PERMISSIONS)`');
		if(authorrole.position < memberrole.position || authorrole.position === memberrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO YOURS)`');
		if(memberrole.position > botrole.position || memberrole.position === botrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO MINE)`');
		if(!message.guild.member(member.user).bannable) return message.channel.send('`Invalid Permission (USER NOT BANNABLE)`');

		return member.ban({ reason: `${reason || 'No reason provided.'}` })
			.then(() => {
				bEmbed.setDescription(`**Result:** ${member} (ID: \`${member.id}\`) has been banned\n\n**Banned By:** <@${message.author.id}>\n**Reason:** ${reason || 'No reason provided'}`);
				return message.channel.send(bEmbed);
			})
			.catch((error) => {
				console.error(`[BAN CMD] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };