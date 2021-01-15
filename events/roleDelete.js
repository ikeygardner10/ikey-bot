const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, role) => {

	const checkTracking = 'SELECT `roles`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [role.guild.id]);
	const [roles, channel] = [logRows[0].roles, logRows[0].logChannel];
	if(roles === 0) return;

	const logsChannel = role.guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, role.guild, channel, 'text', 500, 'logs', role.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	const rEmbed = new MessageEmbed()
		.setAuthor('Role Delete', role.guild.iconURL())
		.setDescription(`**Name:** ${role.name}\n**ID:** ${role.id}`)
		.setFooter(`${role.guild.name}`)
		.setTimestamp()
		.setColor(role.hexColor);


	return logsChannel.send(rEmbed);

};