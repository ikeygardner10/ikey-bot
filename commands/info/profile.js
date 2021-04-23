/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { status, permissions, flags, activity } = require('../../data/arrayData.json');

module.exports = {
	config: {
		name: 'profile',
		aliases: ['pr', 'prof'],
		usage: '<@user (optional)>',
		cooldown: 5,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Display member info for server',
	},
	execute: async (client, message, args) => {

		// Define member and user, if ID is given, fetch member and user, redefine
		let member = message.mentions.members.first() || message.member;
		let user = member.user;
		if(args[0] && args[0].match(/^[0-9]{18}$/)) {
			await message.guild.members.fetch(args[0]);
			member = message.guild.members.cache.get(args[0]);
			await client.users.fetch(args[0]);
			user = client.users.cache.get(args[0]);
		}

		// Define roles, and remove @everyone
		const roles = member.roles.cache.map(r => `${r}`).join(' ');
		const roleList = roles.replace(/@everyone/g, '');

		// Create array, define list
		const actArray = []; let actList = 'None';
		if(user.presence.activities) {

			// Wait to push activities to array
			await user.presence.activities.forEach(async act => {
				switch(act.type) {
				case 'CUSTOM_STATUS':
					if(act.state === null) return;
					else return actArray.push(`${act.state} *(Custom Status)*`);
				case 'LISTENING':
					return actArray.push(`Listening to: **${act.details}** by **${act.state.replace(/;/g, ', ')}**`);
				case 'PLAYING':
					if(act.applicationID === '438122941302046720') return actArray.push(`**Xbox**\n${act.name}`);
					else return actArray.push(`**${act.name}**\n${act.details || ''}\n${act.state || ''}`);
					// actArray.push(`${activity[act.type]}: **${act.name}**`);
				default:
					return actArray.push(`${activity[act.type]}: **${act.name}**`);
				}
			});

			// Switch for actList, join if > 1
			actList = `\n${actArray.join('\n')}`;
		}

		// Create array, define list
		const permArray = []; let permList = 'None';
		if(member.permissions) {

			// Wait to push activities to array
			await member.permissions.toArray().forEach(perm => {
				permArray.push(permissions[perm]);
			});

			// Switch for permList, join if > 1
			if(permArray.length === 1) permList = permArray.join(' ');
			if(permArray.length > 1) permList = `\n${permArray.join('\n')}`;
		}

		// Create array, define list
		const flagArray = []; let userFlags = 'None';
		if(user.flags) {

			// Wait to push activities to array
			await user.flags.toArray().forEach(flag => {
				flagArray.push(flags[flag]);
			});

			// Join userFlags
			userFlags = flagArray.join(', ');
		}

		// Create embed pageOne
		const pageOne = new MessageEmbed()
			.setAuthor('User Profile', member.user.avatarURL())
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setDescription(`**:pencil: Username:** ${user.tag}\n**:robot: Bot:** ${user.bot ? 'Yes' : 'No'}\n**:satellite: Status:** ${status[user.presence.status]}\n**:beginner: Account Flags:** ${userFlags}\n**:video_game: __Activity:__** ${actList}\n\n**:calendar: Account Created:** ${moment(user.createdAt).format('MMMM Do YYYY')}\n**:calendar_spiral: Server Joined:** ${moment(member.joinedAt).format('MMMM Do YYYY')}\n\n**:gem: Boost:** ${member.premiumSinceTimestamp ? 'Yes' : 'No'}\n**:rainbow: Roles:** ${roleList || 'No Roles'}`)
			.setFooter(`ID: ${member.user.id}`)
			.setTimestamp()
			.setColor(member.displayHexColor || 0xFFFFFA);

		// Create embed pageTwo
		const pageTwo = new MessageEmbed()
			.setAuthor('User Profile', member.user.avatarURL())
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setDescription(`**:pencil: Username:** ${user.tag}\n\n**:question: Permissions:** ${permList}`)
			.setFooter(`ID: ${message.author.id}`)
			.setTimestamp()
			.setColor(member.displayHexColor || 0xFFFFFA);

		// Define currentPage then send embed and create reaction collector
		let currentPage = pageOne;
		message.channel.send(currentPage).then(msg => {
			if(permList === 'None') return;
			msg.react('➡️');
			const collector = msg.createReactionCollector((reaction, author) => ['⬅️', '➡️'].includes(reaction.emoji.name) && author.id === message.author.id, { time: 60000 });
			collector.on('collect', reaction => {
				msg.reactions.removeAll().then(async () => {
					if(reaction.emoji.name === '⬅️') currentPage = pageOne;
					if(reaction.emoji.name === '➡️') currentPage = pageTwo;
					msg.edit(currentPage);
					if(currentPage === pageTwo) await msg.react('⬅️');
					if(currentPage === pageOne) await msg.react('➡️');
				});
			});
		});

	} };