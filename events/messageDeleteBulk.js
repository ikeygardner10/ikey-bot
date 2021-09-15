const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, messages) => {

	const message = messages.get(await messages.firstKey());

	const stmt = 'SELECT `messages`, `activityLogs` FROM `logsettings` WHERE `guildID`=?;';
	const SQLpool = client.conPool.promise();

	const [rows] = await SQLpool.query(stmt, [message.guild.id]);
	const [enabled, channel] = [rows[0].messages, rows[0].activityLogs];
	if(enabled === 0) return;

	const embed = new MessageEmbed()
		.setAuthor('Bulk Message Delete', message.guild.iconURL())
		.setDescription(`**In channel:** \`#${await message.guild.channels.cache.get(message.channel.id).name}\`\n**Amount:** ${messages.size}`)
		.setFooter(`Channel ID: ${message.channel.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	let logChannel = await message.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		return createChannel(client, message.guild, 'activity-logs', 'text', 500, 'activity-logs', message.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = message.guild.channels.cache.find(ch => ch.name === 'activity-logs');
				return logChannel.send(embed);
			})
			.catch((error) => {
				return console.error(`[MESSAGE DELETE BULK] ${error.stack}`);
			});
	}
	else {
		return logChannel.send(embed);
	}

};