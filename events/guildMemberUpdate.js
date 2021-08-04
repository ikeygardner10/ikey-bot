const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, oldMember, newMember) => {

	const stmt = 'SELECT `roles`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [newMember.guild.id]);
	const [roles, channel] = [rows[0].roles, rows[0].logChannel];
	if(roles === 0) return;

	const logsChannel = newMember.guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, newMember.guild, channel, 'text', 500, 'logs', newMember.guild.id, [], ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	let difference = '';
	let author;

	const oldRoles = await oldMember.roles.cache.map(r => `${r}`);
	const newRoles = await newMember.roles.cache.map(r => `${r}`);

	const removed = await oldRoles.filter(r => !newRoles.includes(r));
	const added = await newRoles.filter(r => !oldRoles.includes(r));

	if(removed.length !== 0) {
		difference = removed;
		author = 'Role Removed';
	}
	else if(added.length !== 0) {
		difference = added;
		author = 'Role Added';
	}

	if(difference.length === 0) return;

	const embed = new MessageEmbed()
		.setAuthor(`${author}`, newMember.guild.iconURL())
		.setDescription(`**User:** ${newMember.user}\n**Role:** ${difference}`)
		.setFooter(`ID: ${newMember.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	return logsChannel.send(embed);

};