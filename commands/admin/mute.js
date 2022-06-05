/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const sendEmbed = require('../../functions/sendEmbed.js');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'mute',
		aliases: ['m', 'stfu'],
		usage: '<@user> <24d/24h/24m/24s (24 days max, no space)> <reason (optional)> / $mute list',
		cooldown: 5,
		category: 'admin',
		permissions: 'Mute Members',
		args: true,
		descriptions: '\nMutes member for set time, with optional reason\nOr list muted members',
	},
	execute: async (client, message, args) => {

		if(args[0] === 'list') {

			// Define array to push mutes into
			// Define embed author to pass to function
			const muteListArray = [];
			const author = `${message.guild.name}'s mute users`;

			// Grab all muted members, return if none found
			const muteList = message.guild.roles.cache.find(role => role.name === 'Muted').members;
			if(!muteListArray[0]) return message.lineReply('`Invalid (NO MUTED USERS)`');

			// Wait for muted users to be mapped via tag, then push each one into the array
			await muteList.map(user => user.user.tag).forEach(mute => {
				muteListArray.push(mute);
			});

			// Pass to embed function
			return sendEmbed(message, muteListArray, author, 15, '\n');
		}

		// Define member, return if no member mentioned
		const member = message.guild.member(await getMember(message, args));
		if(member.id === message.author.id) return message.lineReply('`Invalid (MENTION USER/USER ID - NOT YOURSELF)`');

		// Define args[1] as the mutetime, and the rest as reason
		// Join the reason together to look pretty
		let mutetime;
		let restArgs;
		if(message.content.match(/<@!\d+?>/)) {
			[, mutetime, ...restArgs] = args;
		}
		else {
			[mutetime, ...restArgs] = args;
		}

		const reason = restArgs.join(' ');

		// A few role checks, first define author, member & bot highest roles
		// Checks if member has admin/mod perms, return if true
		// Checks for author to member role, returns if member is equal or higher
		// Checks for bot to member role, returns if member is equal or higher
		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest;
			const memberrole = member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			const perms = ['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER'];
			if(member.hasPermission(perms)) return message.lineReply('`Invalid Permission (USER HAS ADMIN/MOD PERMISSIONS)`');
			if(authorrole.position <= memberrole.position) return message.lineReply('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO YOURS)`');
			if(memberrole.position >= botrole.position) return message.lineReply('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO MINE)`');
		}

		// If no mutetime specified, return
		if(!mutetime) return message.lineReply('`Invalid (NO MUTE TIME)`');
		if(typeof ms(mutetime) !== 'number') return message.lineReply('`Invalid (NOT A VALID TIME)`');
		if(ms(mutetime) > 2147483647) return message.lineReply('`Invalid (24 DAYS MAXIMUM TIME)`');
		if(ms(mutetime) < 1000) return message.lineReply('`Invalid (1 SECOND MINIMUM TIME)`');

		// Create basic embed
		const mEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Define muterole, case sensitive
		// If no muterole found, attempt to make one, creating channel overrides too
		let muterole = message.guild.roles.cache.find(r => r.name === 'Muted');
		if(!muterole) {
			try {
				muterole = await message.guild.roles.create({
					data: { name: 'Muted', color: '#818386', permissions: [] } });
				message.guild.channels.cache.forEach(async (channel, id) => {
					await channel.createOverwrite(muterole, { SEND_MESSAGES: false, ADD_REACTIONS: false });
				});
			}
			catch(error) {
				console.error(`[MUTE CMD] ${error.stack}`);
				return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}

		// if mentioned member already has the muted role, return
		if(member.roles.cache.has(muterole.id)) return message.lineReply('`Invalid (USER ALREADY MUTED)`');

		// Wait for member to be muted, then return embed, or fails and return error
		await (member.roles.add(muterole.id))
			.then(() => {
				mEmbed.setDescription(`**Result:** ${member} has been muted.\n\n**Muted By:** <@${message.author.id}>\n**Time:** ${ms(ms(mutetime))}\n**Reason:** ${reason || 'No reason provided.'}`);
				message.lineReply(mEmbed);
			})
			.catch((error) => {
				console.error(`[MUTE CMD] ${error.stack}`);
				return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});

		// Start timeout function to remove muted role based on mutetime
		setTimeout(function() {
			member.roles.remove(muterole.id);
		}, ms(mutetime));
	},
};