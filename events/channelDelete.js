const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, channel) => {

	if(channel.type === 'dm') return;

	const stmt = 'SELECT `channels`, `serverLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [channel.guild.id]);
	const enabled = rows[0].channels;
	if(enabled === 0) return;

	const embed = new MessageEmbed()
		.setTimestamp()
		.setColor(0xFFFFFA);

	if(channel.parent !== null) {
		const category = await channel.guild.channels.cache.get(channel.parent.id).name;
		embed.setAuthor('Channel Deleted', channel.guild.iconURL());
		embed.setDescription(`**Channel:** \`#${channel.name}\`\n**Category:** ${category.slice(0, 1).toUpperCase() + category.slice(1, category.length)}`);
		embed.setFooter(`Channel ID: ${channel.id}\nCategory ID: ${channel.parent.id}`);
	}
	else {
		embed.setAuthor('Category Deleted', channel.guild.iconURL());
		embed.setDescription(`**Category:** ${channel.name.slice(0, 1).toUpperCase() + channel.name.slice(1, channel.name.length)}`);
		embed.setFooter(`Category ID: ${channel.id}`);
	}

	let logChannel = await channel.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, channel.guild, 'server-logs', 'text', 500, 'server-logs', channel.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = channel.guild.channels.cache.find(ch => ch.name === 'server-logs');
				return logChannel.send(embed);
			})
			.catch((error) => {
				return console.error(`[CHANNEL DELETE] ${error.stack}`);
			});
	}
	else {
		return logChannel.send(embed);
	}

};