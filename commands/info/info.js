/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
	config: {
		name: 'info',
		aliases: ['bot'],
		usage: '',
		cooldown: 10,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Display bot info',
	},
	execute: async (client, message, args) => {

		const config = client.config; const uptime = process.uptime();
		const date = new Date(uptime * 1000);
		const days = date.getUTCDate() - 1, hours = date.getUTCHours(),
			minutes = date.getUTCMinutes(), seconds = date.getUTCSeconds(),
			milliseconds = date.getUTCMilliseconds();
		const segments = [];
		if(days > 0) segments.push(days + 'd' + ((days == 1) ? '' : ''));
		if(hours > 0) segments.push(hours + 'h' + ((hours == 1) ? '' : ''));
		if(minutes > 0) segments.push(minutes + 'm' + ((minutes == 1) ? '' : ''));
		if(seconds > 0) segments.push(seconds + 's' + ((seconds == 1) ? '' : ''));
		if(milliseconds > 0) segments.push(milliseconds + 'ms' + ((seconds == 1) ? '' : ''));
		const dateString = segments.join(', '); const ping = Math.round(client.ws.ping);

		const iEmbed = new MessageEmbed()
			.setAuthor(`${client.user.username}`, client.user.avatarURL())
			.setDescription(`**:exclamation: Global Prefix: ${config.defaultPrefix}**\n**:scroll: Command List:** [Webpage](https://ikeygardner10.github.io/)\n**:mailbox: Support Server:** [${await client.guilds.cache.get('413532909400752139').name || 'Link'}](https://discord.gg/GQh6XEk)\n**:incoming_envelope: Invite:** [Link](https://discordapp.com/api/oauth2/authorize?client_id=607091388588359687&permissions=8&scope=bot)\n**:globe_with_meridians: Github:** [ikeygardner10](https://github.com/ikeygardner10/ikey-bot)\n**:bust_in_silhouette: Developer:** <@341086875232108545>\n\n**:clock1: Uptime:** ${dateString}\n**:dividers: Servers:** ${message.client.guilds.cache.size}\n**:busts_in_silhouette: Users:** ${message.client.users.cache.size}\n**:arrows_counterclockwise: Ping:** \`${ping}ms\`\n**:calendar: Bot Created:** ${moment(client.user.createdAt).format('MMMM Do YYYY')}\n**:vs: Version:** ${config.version}\n**:id: ID:** ${client.user.id}`)
			.setFooter('JOIN THE SUPPORT SERVER', client.user.avatarURL())
			.setTimestamp()
			.setColor('0xFFFFFA');

		return message.channel.send(iEmbed);

	} };