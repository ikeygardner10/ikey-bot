const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, message) => {

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
		.setAuthor('Message Deleted', message.guild.iconURL())
		.setDescription(`**Message from:** ${message.author}\n**In channel:** \`#${await message.guild.channels.cache.get(message.channel.id).name}\`\n**Content:**\n${message.content}`)
		.setFooter(`Message ID: ${message.id}\nAuthor ID: ${message.author.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	return logChannel.send(embed);

};