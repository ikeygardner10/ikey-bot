const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, messages) => {

	const message = messages.get(await messages.firstKey());

	const stmt = 'SELECT `messages`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';
	const SQLpool = client.conPool.promise();

	const [rows] = await SQLpool.query(stmt, [message.guild.id]);
	const [enabled, channel] = [rows[0].messages, rows[0].logChannel];
	if(enabled === 0) return;

	const logChannel = await message.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, message.guild, channel, 'text', 500, 'logs', message.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				return console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	const embed = new MessageEmbed()
		.setAuthor('Bulk Message Delete', message.guild.iconURL())
		.setDescription(`**In channel:** \`#${await message.guild.channels.cache.get(message.channel.id).name}\`\n**Amount:** ${messages.size}`)
		.setFooter(`Channel ID: ${message.channel.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	return logChannel.send(embed);

};