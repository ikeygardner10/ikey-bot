const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, channel) => {

	if(channel.type === 'dm') return;

	const stmt = 'SELECT `channels`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [channel.guild.id]);
	const enabled = rows[0].channels;
	if(enabled === 0) return;

	const logChannel = await channel.guild.channels.cache.find(ch => ch.name === rows[0].logChannel);
	if(!logChannel) {
		await createChannel(client, channel.guild, rows[0].logChannel, 'text', 500, 'logs', channel.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				return console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	const embed = new MessageEmbed()
		.setTimestamp()
		.setColor(0xFFFFFA);

	const type = channel.type.slice(0, 1).toUpperCase() + channel.type.slice(1, channel.type.length);

	if(channel.parent !== null) {
		const category = await channel.guild.channels.cache.get(channel.parent.id).name;
		const nsfw = channel.nsfw ? 'Yes' : 'No';
		embed.setAuthor('Channel Created', channel.guild.iconURL());
		embed.setDescription(`**Channel:** \`#${channel.name}\`\n**Category:** ${category.slice(0, 1).toUpperCase() + category.slice(1, category.length)}\n**Type:** ${type}\n**NSFW:** ${nsfw}`);
		embed.setFooter(`Channel ID: ${channel.id}\nCategory ID: ${channel.parent.id}`);
	}
	else {
		embed.setAuthor('Category Created', channel.guild.iconURL());
		embed.setDescription(`**Category:** ${channel.name.slice(0, 1).toUpperCase() + channel.name.slice(1, channel.name.length)}`);
		embed.setFooter(`Category ID: ${channel.id}`);
	}

	return logChannel.send(embed);

};