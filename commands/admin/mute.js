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
			try {
				const muted = message.guild.roles.cache.find(role => role.name === 'Muted').members;
				const list = muted.map(u => u.user.tag).join('\n');
				if(!list) return message.channel.send('No muted members.');
				return message.channel.send(`**${muted.size} member(s) are muted:**\n${list}`, { split: true });
			} catch(error) {
				console.error(`[MUTE CMD] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}

		const member = message.guild.member(message.mentions.members.first()); if(!member) return message.channel.send('Mention a user.');
		const [, mutetime, ...restArgs] = args; const reason = restArgs.join(' ');

		if(!mutetime) return message.channel.send('Specify a time.');
		if(typeof ms(mutetime) !== 'number') return message.channel.send('Not a valid time');

		const authorrole = message.member.roles.highest; const memberrole = member.roles.highest;
		const botrole = message.guild.me.roles.highest;
		if(member.hasPermission(['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER', 'MUTE_MEMBERS'])) return message.channel.send('`Invalid Permission (USER HAS ADMIN/MOD PERMISSIONS)`');
		if(authorrole.position < memberrole.position || authorrole.position === memberrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO YOURS)`');
		if(memberrole.position > botrole.position || memberrole.position === botrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO MINE)`');
		if(member.roles.cache.has(muterole.id)) return message.channel.send('`Invalid (USER ALREADY MUTED)`');

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