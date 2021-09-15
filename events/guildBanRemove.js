const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, guild, user) => {

	const checkLogSettings = 'SELECT `members`, `userLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkLogSettings, [guild.id]);
	const [enabled, channel] = [logRows[0].members, logRows[0].userLogs];
	if(enabled === 0) return;

	const embed = new MessageEmbed()
		.setAuthor('Member Unban', guild.iconURL())
		.setThumbnail(user.avatarURL())
		.setDescription(`**Username:** ${user.tag}`)
		.setFooter(`ID: ${user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	let logChannel = await guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, guild, 'user-logs', 'text', 500, 'user-logs', guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = guild.channels.cache.find(ch => ch.name === 'user-logs');
				return logChannel.send(embed);
			})
			.catch((error) => {
				return console.error(`[GUILD BAN REMOVE] ${error.stack}`);
			});
	}
	else {
		return logChannel.send(embed);
	}
};