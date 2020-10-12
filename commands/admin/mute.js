/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
	config: {
		name: 'mute',
		aliases: ['m', 'stfu'],
		usage: '<@user> <time h/m/s> <reason (optional)>/list',
		cooldown: 5,
		category: 'admin',
		permissions: 'Mute Members',
		args: true,
		descriptions: '\nMutes member for set time, with optional reason\nOr list muted members',
	},
	execute: async (client, message, args) => {

		if(args[0] === 'list') {

			const muteListArray = []; let currentIndex = 0;
			const muteList = message.guild.roles.cache.find(role => role.name === 'Muted').members;
			if(muteListArray.length === 0) return message.channel.send('`Invalid (NO MUTED USERS)`');

			const generateEmbed = start => {
				const current = muteListArray.slice(start, start + 15);
				const mEmbed = new MessageEmbed()
					.setTimestamp()
					.setColor(0xFFFFFA)
					.setAuthor(`${message.guild.name}'s mute list`)
					.setDescription(`Muted users ${start + 1}-${start + current.length} out of ${muteListArray.length}\n\n${current.join('\n')}\n`);

				return mEmbed;
			};

			const sendEmbed = () => {
				message.channel.send(generateEmbed(0)).then(msg => {
					if(muteListArray.length <= 15) return;
					msg.react('➡️');
					const collector = msg.createReactionCollector((reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 60000 });
					currentIndex = 0;
					collector.on('collect', reaction => {
						msg.reactions.removeAll().then(async () => {
							reaction.emoji.name === '⬅️' ? currentIndex -= 15 : currentIndex += 15;
							msg.edit(generateEmbed(currentIndex));
							if(currentIndex !== 0) await msg.react('⬅️');
							if(currentIndex + 15 < muteListArray.length) msg.react('➡️');
						});
					});
				});
			};

			await muteList.map(user => user.user.tag).forEach(mute => {
				muteListArray.push(mute);
			});

			return sendEmbed();
		}

		const member = message.guild.member(message.mentions.members.first()); if(!member) return message.channel.send('Mention a user.');
		const [, mutetime, ...restArgs] = args; const reason = restArgs.join(' ');

		if(!mutetime) return message.channel.send('Specify a time.');
		if(typeof ms(mutetime) !== 'number') return message.channel.send('Not a valid time');

		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest; const memberrole = member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			if(member.hasPermission(['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER', 'MUTE_MEMBERS'])) return message.channel.send('`Invalid Permission (USER HAS ADMIN/MOD PERMISSIONS)`');
			if(authorrole.position < memberrole.position || authorrole.position === memberrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO YOURS)`');
			if(memberrole.position > botrole.position || memberrole.position === botrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO MINE)`');
		}

		const mEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		let muterole = message.guild.roles.cache.find(r => r.name === 'Muted');
		if(!muterole) {
			try {
				muterole = await message.guild.roles.create({
					data: { name: 'Muted', color: '#818386', permissions: [] } });
				message.guild.channels.cache.forEach(async (channel, id) => {
					await channel.createOverwrite(muterole, { SEND_MESSAGES: false, ADD_REACTIONS: false });
				});
			} catch(error) {
				console.error(`[MUTE CMD] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}

		if(member.roles.cache.has(muterole.id)) return message.channel.send('`Invalid (USER ALREADY MUTED)`');
		await (member.roles.add(muterole.id))
			.then(() => {
				mEmbed.setDescription(`**Result:** ${member} has been muted.\n\n**Muted By:** <@${message.author.id}>\n**Time:** ${ms(ms(mutetime))}\n**Reason:** ${reason || 'No reason provided.'}`);
				return message.channel.send(mEmbed);
			})
			.catch((error) => {
				console.error(`[MUTE CMD] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});

		setTimeout(function() {
			member.roles.remove(muterole.id);
		}, ms(mutetime));
	},
};