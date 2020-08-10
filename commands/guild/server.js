/* eslint-disable no-unused-vars */
// Grab required modules
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

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

		const bots = message.guild.members.cache.filter(m => m.user.bot).size;
		const users = message.guild.members.cache.filter(m => !m.user.bot).size;
		const roles = message.guild.roles.cache.size;
		const emojis = message.guild.emojis.cache.size;
		const textch = message.guild.channels.cache.filter(c => c.type === 'text').size;
		const voicech = message.guild.channels.cache.filter(c => c.type === 'voice').size;
		const channelch = message.guild.channels.cache.filter(c => c.type === 'category').size;
		const verification = {
			NONE: 'Off :zero:', LOW: 'Low :one:',
			MEDIUM: 'Medium :two:', HIGH: 'High :three:',
			VERY_HIGH: 'Highest :four:',
		};
		const premium = {
			0: 'None :zero:', 1: 'Level 1 :one:',
			2: 'Level 2 :two:', 3: 'Level 3 :three:',
		};
		const region = {
			'eu-central': 'Central Europe :flag_eu:', 'singapore': 'Singapore :flag_sg:',
			'us-central': 'U.S. Central :flag_us:', 'sydney': 'Sydney :flag_au:',
			'us-east': 'U.S. East :flag_us:', 'us-south': 'U.S. South :flag_us:',
			'us-west': 'U.S. West :flag_us:', 'eu-west': 'Western Europe :flag_eu:',
			'vip-us-east': 'VIP U.S. East :flag_us:', 'london': 'London :flag_gb:',
			'amsterdam': 'Amsterdam :flag_nl:', 'hongkong': 'Hong Kong :flag_hk:',
			'russia': 'Russia :flag_ru:', 'southafrica': 'South Africa :flag_za:',
		};

		const checkPrefix = 'SELECT `prefix` FROM `guildsettings` WHERE `guildID`= ?';
		const SQLpool = client.conPool.promise();
		const [prefix] = await SQLpool.execute(checkPrefix, [message.guild.id]);

		const sEmbed = new MessageEmbed()
			.setAuthor('Server Information', client.user.avatarURL())
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
			.setDescription(`**Name:** ${message.guild.name}\n**Owner:** <@${message.guild.owner.user.id}>\n**Prefix: ${prefix[0].prefix}**\n\n**Verification:** ${verification[message.guild.verificationLevel]}\n**Region:** ${region[message.guild.region]}\n**Boost Level:** ${premium[message.guild.premiumTier]}\n\n**:busts_in_silhouette: Members:** ${users}\n**:robot: Bots:** ${bots}\n**:sweat_smile: Emojis:** ${emojis} *(+emojis)*\n**:dividers: Categories:** ${channelch}\n**:speech_balloon: Text Channels:** ${textch}\n**:loud_sound: Voice Channels:** ${voicech}\n**:rainbow: Roles:** ${roles} *(+roles)*\n**:gem: Boost Count:** ${message.guild.premiumSubscriptionCount}\n**:calendar: Created:** ${moment(message.guild.createdAt).format('dddd, MMMM Do YYYY')}`)
			.setFooter(`ID: ${message.guild.id}`, message.guild.iconURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		return message.channel.send(sEmbed);
	} };