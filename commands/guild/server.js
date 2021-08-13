/* eslint-disable no-unused-vars */
// Grab required modules
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { verification, premium, region } = require('../../data/arrayData.json');

module.exports = {
	config: {
		name: 'server',
		aliases: ['guild'],
		usage: '',
		cooldown: 10,
		category: 'guild',
		permissions: '',
		args: false,
		description: 'View server details',
	},
	execute: async (client, message, args) => {

		// Fetch guild members, define members and bots
		await message.guild.members.fetch();
		const bots = message.guild.members.cache.filter(m => m.user.bot).size;
		const members = message.guild.members.cache.filter(m => !m.user.bot).size;

		// Fetch guild roles, define roles
		await message.guild.roles.fetch();
		const roles = message.guild.roles.cache.size;

		// Define emojis, text and voice channels, categories
		const emojis = message.guild.emojis.cache.size;
		const textch = message.guild.channels.cache.filter(c => c.type === 'text').size;
		const voicech = message.guild.channels.cache.filter(c => c.type === 'voice').size;
		const channelch = message.guild.channels.cache.filter(c => c.type === 'category').size;

		// Outline SQL statement, define SQLpool, define SQL query
		const checkPrefix = 'SELECT `prefix` FROM `guildsettings` WHERE `guildID`= ?';
		const SQLpool = client.conPool.promise();
		const [prefix] = await SQLpool.execute(checkPrefix, [message.guild.id]);

		// Create embed
		const embed = new MessageEmbed()
			.setAuthor('Server Information', client.user.avatarURL())
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
			.setDescription(`**Name:** ${message.guild.name}\n**Owner:** <@${message.guild.owner.user.id}>\n**Prefix: ${prefix[0].prefix}**\n\n**Verification:** ${verification[message.guild.verificationLevel]}\n**Region:** ${region[message.guild.region]}\n**Boost Level:** ${premium[message.guild.premiumTier]}\n\n**:busts_in_silhouette: Members:** ${members}\n**:robot: Bots:** ${bots}\n**:sweat_smile: Emojis:** ${emojis} *(${prefix[0].prefix}emojis)*\n**:dividers: Categories:** ${channelch}\n**:speech_balloon: Text Channels:** ${textch}\n**:loud_sound: Voice Channels:** ${voicech}\n**:rainbow: Roles:** ${roles} *(${prefix[0].prefix}roles)*\n**:gem: Boost Count:** ${message.guild.premiumSubscriptionCount}\n**:calendar: Created:** ${moment(message.guild.createdAt).format('dddd, MMMM Do YYYY')}`)
			.setFooter(`ID: ${message.guild.id}`)
			.setTimestamp()
			.setColor(0xFFFFFA);

		let desc = `**Name:** ${message.guild.name}\n**Owner:** <@${message.guild.owner.user.id}>\n**Prefix: ${prefix[0].prefix}**\n\n**Verification:** ${verification[message.guild.verificationLevel]}\n**Region:** ${region[message.guild.region]}\n**Boost Level:** ${premium[message.guild.premiumTier]}\n\n**:busts_in_silhouette: Members:** ${members}\n**:robot: Bots:** ${bots}\n**:sweat_smile: Emojis:** ${emojis} *(${prefix[0].prefix}emojis)*\n**:dividers: Categories:** ${channelch}\n**:speech_balloon: Text Channels:** ${textch}\n**:loud_sound: Voice Channels:** ${voicech}\n**:rainbow: Roles:** ${roles} *(${prefix[0].prefix}roles)*\n**:gem: Boost Count:** ${message.guild.premiumSubscriptionCount}\n**:calendar: Created:** ${moment(message.guild.createdAt).format('dddd, MMMM Do YYYY')}`;
		let url = `https://cdn.discordapp.com/banners/${message.guild.id}/`;
		if(message.guild.banner) {
			if(message.guild.banner.startsWith('a_')) url += `${message.guild.banner}.gif`;
			else url += `${message.guild.banner}.png`;

			desc += '\n\n**Banner:**';
			embed.setDescription(desc);
			embed.setImage(`${url}`);
		}

		// Return embed
		return message.lineReply(embed);
	} };