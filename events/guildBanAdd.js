const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, guild, user) => {


	const checkLogSettings = 'SELECT `members`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkLogSettings, [guild.id]);
	const [members, channel] = [logRows[0].members, logRows[0].logChannel];
	if(members === 0) return;

	const logsChannel = guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, guild, channel, 'text', 500, 'logs', guild.id, [], ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD BAN ADD] ${error.stack}`);
			});
	}

	const iEmbed = new MessageEmbed()
		.setAuthor('Member Ban', guild.iconURL())
		.setThumbnail(user.avatarURL())
		.setDescription(`**Username:** ${user.tag}`)
		.setFooter(`ID: ${user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	return logsChannel.send(iEmbed);
};