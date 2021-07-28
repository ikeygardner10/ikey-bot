const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const ms = require('ms');

module.exports = async (client, oldChannel, newChannel) => {

	if(channel.type === 'dm') return;

	const stmt = 'SELECT `channels`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [newChannel.guild.id]);
	const [enabled, channel] = [rows[0].channels, rows[0].logChannel];
	if(enabled === 0) return;

	const logChannel = await newChannel.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, newChannel.guild, channel, 'text', 500, 'logs', newChannel.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				return console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	const embed = new MessageEmbed()
		.setAuthor('Channel Updated', newChannel.guild.iconURL())
		.setTimestamp()
		.setColor(0xFFFFFA);

	const differences = {};
	Object.entries(newChannel).forEach(([key, value]) => {
		switch(key) {
		case 'rawPosition':
			return;
		case 'permissionOverwrites':
			return;
		case 'lastPinTimestamp':
			return;
		case 'messages':
			return;
		case 'name':
			if(oldChannel[key] === newChannel[key]) return;
			return differences['Old Name'] = oldChannel.name;
		case 'topic':
			if(oldChannel[key] === newChannel[key]) return;
			if(value === null) return differences['Topic'] = 'None';
			return differences['Topic'] = value;
		case 'parentID': {
			if(oldChannel[key] === newChannel[key]) return;
			const category = newChannel.guild.channels.cache.get(newChannel.parent.id).name;
			return differences['Category'] = category;
		}
		case 'nsfw':
			if(oldChannel[key] === newChannel[key]) return;
			return differences['NSFW'] = value ? 'Yes' : 'No';
		case 'rateLimitPerUser':
			if(oldChannel[key] === newChannel[key]) return;
			if(value === 0) return differences['Slowmode'] = 'Off';
			return differences['Slowmode'] = ms(value * 1000);
		default:
			if(oldChannel[key] === newChannel[key]) return;
			return differences[key] = value;
		}
	});

	if(Object.keys(differences).length === 0) return;

	let desc = `**Channel:** \`#${newChannel.name}\`\n`;
	Object.entries(differences).forEach(([key, value]) => {
		desc += `**${key}:** ${value}\n`;
	});

	embed.setDescription(desc);
	embed.setFooter(`Channel ID: ${newChannel.id}`);

	return logChannel.send(embed);

};