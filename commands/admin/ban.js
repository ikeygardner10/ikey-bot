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

			const banListArray = []; let currentIndex = 0;

			const generateEmbed = start => {
				const current = banListArray.slice(start, start + 15);
				const bEmbed = new MessageEmbed()
					.setTimestamp()
					.setColor(0xFFFFFA)
					.setAuthor(`${message.guild.name}'s ban list`)
					.setDescription(`Bans ${start + 1}-${start + current.length} out of ${banListArray.length}\n\n${current.join('\n')}\n`);

				return bEmbed;
			};

			const sendEmbed = () => {
				message.channel.send(generateEmbed(0)).then(msg => {
					if(banListArray.length <= 15) return;
					msg.react('➡️');
					const collector = msg.createReactionCollector((reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 60000 });
					currentIndex = 0;
					collector.on('collect', reaction => {
						msg.reactions.removeAll().then(async () => {
							reaction.emoji.name === '⬅️' ? currentIndex -= 15 : currentIndex += 15;
							msg.edit(generateEmbed(currentIndex));
							if(currentIndex !== 0) await msg.react('⬅️');
							if(currentIndex + 15 < banListArray.length) msg.react('➡️');
						});
					});
				});
			};

			await message.guild.fetchBans().then(banned => {
				banned.map(user => user.user.tag).forEach(ban => {
					banListArray.push(ban);
				});
			});

			if(banListArray.length === 0) return message.channel.send('`Invalid (NO BANNED USERS)`');
			return sendEmbed();
		}

		const member = message.mentions.members.first(); if(!member) return message.channel.send('`Invalid (MENTION USER)`');
		const [, ...restArgs] = args; const reason = restArgs.join(' ');

		const bEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest; const memberrole = member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			if(member.hasPermission(['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER', 'MUTE_MEMBERS'])) return message.channel.send('`Invalid Permission (USER HAS ADMIN/MOD PERMISSIONS)`');
			if(authorrole.position < memberrole.position || authorrole.position === memberrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO YOURS)`');
			if(memberrole.position > botrole.position || memberrole.position === botrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO MINE)`');
		}
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