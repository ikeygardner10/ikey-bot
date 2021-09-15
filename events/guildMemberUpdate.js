const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, oldMember, newMember) => {

	const stmt = 'SELECT `roles`, `activityLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [newMember.guild.id]);
	const [enabled, channel] = [rows[0].roles, rows[0].activityLogs];
	if(enabled === 0) return;

	let difference = '';
	let author;

	const oldRoles = await oldMember.roles.cache.map(r => `${r}`);
	const newRoles = await newMember.roles.cache.map(r => `${r}`);

	const removed = await oldRoles.filter(r => !newRoles.includes(r));
	const added = await newRoles.filter(r => !oldRoles.includes(r));

	if(removed.length !== 0) {
		difference = removed;
		author = 'User Role Removed';
	}
	else if(added.length !== 0) {
		difference = added;
		author = 'User Role Added';
	}

	if(difference.length === 0) return;

	const embed = new MessageEmbed()
		.setAuthor(`${author}`, newMember.user.avatarURL())
		.setDescription(`**User:** ${newMember.user}\n**Role:** ${difference}`)
		.setFooter(`ID: ${newMember.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	let logChannel = await newMember.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, newMember.guild, 'activity-logs', 'text', 500, 'activity-logs', newMember.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = newMember.guild.channels.cache.find(ch => ch.name === 'activity-logs');
				return logChannel.send(embed);
			})
			.catch((error) => {
				return console.error(`[GUILD MEMBER UPDATE] ${error.stack}`);
			});
	}
	else {
		return logChannel.send(embed);
	}

};