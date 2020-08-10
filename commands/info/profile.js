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
		const member = message.mentions.members.first() || message.member;
		const user = member.user; const roleList = member.roles.cache.map(r => `${r}`).join(' ') || 'No Roles';

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

		const pEmbed = new MessageEmbed()
			.setAuthor('User Profile', member.user.avatarURL())
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setDescription(`**:pencil: Username:** ${member.user.tag}\n**:robot: Bot:** ${member.user.bot ? 'Yes' : 'No'}\n**:satellite: Status:** ${status[member.user.presence.status]}\n\n**:calendar_spiral: Server Joined:** ${moment(member.joinedAt).format('MMMM Do YYYY')}\n**:calendar: Account Created:** ${moment(member.user.createdAt).format('MMMM Do YYYY')}\n\n**:question: Permissions:** ${permissions}\n**:gem: Boost:** ${member.premiumSinceTimestamp ? 'Yes' : 'No'}\n**:rainbow: Roles:** ${roleList}`)
			.setFooter(`ID: ${message.author.id}`)
			.setTimestamp()
			.setColor(0xFFFFFA);

		return message.channel.send(pEmbed);
	} };