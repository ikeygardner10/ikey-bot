const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const namer = require('color-namer');
const wait = require('util').promisify(setTimeout);

module.exports = async (client, role) => {

	const checkTracking = 'SELECT `roles`, `serverLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [role.guild.id]);
	const [enabled, channel] = [logRows[0].roles, logRows[0].serverLogs];
	if(enabled === 0) return;

	const roleObj = {};
	client.roleObj = roleObj;
	roleObj[role.id];

	await wait(60 * 1000);

	const names = namer(role.hexColor);
	const color = `${names.ntc[0].name} (${role.hexColor})`;

	const perms = role.permissions.toArray().map(perm => {
		const formatted = perm.split('_').map(x => x[0] + x.slice(1).toLowerCase());
		return formatted.join(' ');
	}).join('\n');

	const embed = new MessageEmbed()
		.setAuthor('Role Created', role.guild.iconURL())
		.setDescription(`**Name:** ${role.name}\n**ID:** ${role.id}\n\n**Color:** ${color}\n**Mentionable:** ${role.menionable ? 'Yes' : 'No'}\n**Dispay Separate:** ${role.hoist ? 'Yes' : 'No'}\n**Managed:** ${role.managed ? 'Yes' : 'No'}\n\n**Permissions:**\n${perms}`)
		.setFooter(`${role.guild.name}`)
		.setTimestamp()
		.setColor(role.hexColor);

	let logChannel = await role.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, role.guild, 'server-logs', 'text', 500, 'server-logs', role.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = role.guild.channels.cache.find(ch => ch.name === 'server-logs');
				logChannel.send(embed);
			})
			.catch((error) => {
				console.error(`[ROLE CREATE] ${error.stack}`);
			});
	}
	else {
		await logChannel.send(embed);
	}

	return delete roleObj[role.id];
};