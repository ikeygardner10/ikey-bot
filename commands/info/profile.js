/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

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

		const status = {
			online: 'Online', idle: 'Idle',
			dnd: 'Do Not Disturb', offline: 'Offline/Invisible',
		};
		const flags = {
			DISCORD_EMPLOYEE: 'Discord Employee', DISCORD_PARTNER: 'Discord Partner', HYPESQUAD_EVENTS: 'Hypesquad Events',
			BUGHUNTER_LEVEL_1: 'Bug Hunter Lvl 1', HOUSE_BRAVERY: 'House Bravery', HOUSE_BRILLIANCE: 'House Brilliance',
			HOUSE_BALANCE: 'House Balance', EARLY_SUPPORTER: 'Early Supporter', TEAM_USER: 'Team User',
			SYSTEM: 'System', BUGHUNTER_LEVEL_2: 'Bug Hunter Lvl 2', VERIFIED_BOT: 'Verified Bot',
			VERIFIED_DEVELOPER: 'Verified Developer',
		};
		const activity = {
			STREAMING: 'Streaming', LISTENING: 'Listening', WATCHING: 'Watching',
			PLAYING: 'Playing', CUSTOM_STATUS: 'Custom Status',
		};
		const member = message.mentions.members.first() || message.member;
		const user = member.user; const roles = member.roles.cache.map(r => `${r}`).join(' ');
		const roleList = roles.replace(/@everyone/g, ''); let actList = 'None';

		let permissions = 'None';
		if(member.hasPermission('MANAGE_MESSAGES' || 'MANAGE_ROLES' || 'BAN_MEMBERS' || 'MUTE_MEMBERS')) {
			permissions = 'Moderator';
		}
		if(member.hasPermission('ADMINISTRATOR')) {
			permissions = 'Administrator';
		}
		if(user.id == message.guild.owner) {
			permissions = 'Server Owner';
		}

		const activities = user.presence.activities; const actArray = [];
		if(activities !== undefined) {
			activities.forEach(act => {
				if(act.type === 'CUSTOM_STATUS') {
					actArray.push(`${act.state} *(Custom Status)*`);
				} else if(act.type === 'LISTENING') {
					actArray.push(`Listening to: ${act.details} by ${act.state.replace(/;/g, ', ')}`);
				} else {
					actArray.push(`${activity[act.type]}: ${act.name}`);
				}
			});
			if(actArray.length === 1) actList = actArray.join(' ');
			if(actArray.length > 1) actList = `\n${actArray.join('\n')}`;
		}

		const flagArray = []; let userFlags = 'None';
		await user.flags.toArray().forEach(flag => {
			flagArray.push(flags[flag]);
		});
		userFlags = flagArray.join(', ');

		const pEmbed = new MessageEmbed()
			.setAuthor('User Profile', member.user.avatarURL())
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setDescription(`**:pencil: Username:** ${member.user.tag}\n**:robot: Bot:** ${member.user.bot ? 'Yes' : 'No'}\n**:satellite: Status:** ${status[member.user.presence.status]}\n**:beginner: Account Flags:** ${userFlags}\n**:video_game: Activity:** ${actList}\n\n**:calendar: Account Created:** ${moment(member.user.createdAt).format('MMMM Do YYYY')}\n**:calendar_spiral: Server Joined:** ${moment(member.joinedAt).format('MMMM Do YYYY')}\n\n**:question: Permissions:** ${permissions}\n**:gem: Boost:** ${member.premiumSinceTimestamp ? 'Yes' : 'No'}\n**:rainbow: Roles:** ${roleList || 'No Roles'}`)
			.setFooter(`ID: ${message.author.id}`)
			.setTimestamp()
			.setColor(0xFFFFFA);

		return message.channel.send(pEmbed);
	} };