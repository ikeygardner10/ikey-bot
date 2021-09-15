const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const wait = require('util').promisify(setTimeout);
const ms = require('ms');

module.exports = async (client, message) => {

	await client.sweepMessages(ms('3d'));

	if(message.author.bot) return;

	const stmt = 'SELECT `messages`, `activityLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [message.guild.id]);
	const [enabled, channel] = [rows[0].messages, rows[0].activityLogs];
	if(enabled === 0) return;

	let attachments = [];
	if(message.attachments.size > 0) {
		await message.attachments.forEach(key => {
			return attachments.push(key.url);
		});
	}

	if(attachments.size === 0) attachments = 'None';

	await wait(1500);

	const embed = new MessageEmbed()
		.setAuthor('Message Deleted', message.guild.iconURL())
		.setDescription(`**Message By:** ${message.author}\n**In Channel:** \`#${await message.guild.channels.cache.get(message.channel.id).name}\`\n\n**Content:** ${message.content}\n\n**Attachments:**\n${attachments.join('\n')}`)
		.setFooter(`Message ID: ${message.id}\nAuthor ID: ${message.author.id}`)
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
				return console.error(`[MESSAGE DELETE] ${error.stack}`);
			});
	}
	else {
		return logChannel.send(embed);
	}

};