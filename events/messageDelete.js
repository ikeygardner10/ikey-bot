const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const wait = require('util').promisify(setTimeout);
const ms = require('ms');

module.exports = async (client, message) => {

	await client.sweepMessages(ms('3d'));

	if(message.author.bot) return;

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

	let embedCount = 0;
	let embeds = '';
	message.embeds.forEach(embed => {
		embedCount++;
	});
	if(embedCount === 1) embeds = '(embed) ';
	if(embedCount > 1) embeds = '(embeds) ';

	let attachments = 0;
	let atchmnt = '';
	if(message.attachments[0]) {
		message.attachemts.forEach(atmt => {
			attachments++;
		});
	}
	if(attachments === 1) atchmnt = '(attachment)';
	if(attachments > 1) atchmnt = '(attachments)';

	await wait(2 * 1000);

	const embed = new MessageEmbed()
		.setAuthor('Message Deleted', message.guild.iconURL())
		.setDescription(`**Message By:** ${message.author}\n**In Channel:** \`#${await message.guild.channels.cache.get(message.channel.id).name}\`\n**Content:** ${embeds}${atchmnt}\n${message.content}`)
		.setFooter(`Message ID: ${message.id}\nAuthor ID: ${message.author.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	return logChannel.send(embed);

};