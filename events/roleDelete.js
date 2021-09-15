const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, role) => {

	const checkTracking = 'SELECT `roles`, `serverLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [role.guild.id]);
	const [enabled, channel] = [logRows[0].roles, logRows[0].serverLogs];
	if(enabled === 0) return;

	const embed = new MessageEmbed()
		.setAuthor('Role Deleted', role.guild.iconURL())
		.setDescription(`**Name:** ${role.name}\n**ID:** ${role.id}`)
		.setFooter(`${role.guild.name}`)
		.setTimestamp()
		.setColor(role.hexColor);

	let logChannel = await role.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		return createChannel(client, role.guild, 'server-logs', 'text', 500, 'server-logs', role.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = role.guild.channels.cache.find(ch => ch.name === 'server-logs');
				return logChannel.send(embed);
			})
			.catch((error) => {
				console.error(`[ROLE DELETE] ${error.stack}`);
			});
	}
	else {
		return logChannel.send(embed);
	}
};