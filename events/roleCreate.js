const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const namer = require('color-namer');
const wait = require('util').promisify(setTimeout);

module.exports = async (client, role) => {

	const checkTracking = 'SELECT `roles`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [role.guild.id]);
	const [roles, channel] = [logRows[0].roles, logRows[0].logChannel];
	if(roles === 0) return;

	const roleObj = {};
	client.roleObj = roleObj;
	roleObj[role.id];

	await wait(60 * 1000);

	const logsChannel = role.guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, role.guild, channel, 'text', 500, 'logs', role.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	const names = namer(role.hexColor);
	const color = `${names.ntc[0].name} (${role.hexColor})`;

	console.warn(JSON.stringify(role));

	const perms = role.permissions.toArray().map(perm => {
		const formatted = perm.split('_').map(x => x[0] + x.slice(1).toLowerCase());
		return formatted.join(' ');
	}).join('\n');

	const rEmbed = new MessageEmbed()
		.setAuthor('Role Created', role.guild.iconURL())
		.setDescription(`**Name:** ${role.name}\n**ID:** ${role.id}\n\n**Color:** ${color}\n**Mentionable:** ${role.menionable ? 'Yes' : 'No'}\n**Dispay Separate:** ${role.hoist ? 'Yes' : 'No'}\n**Managed:** ${role.managed ? 'Yes' : 'No'}\n\n**Permissions:**\n${perms}`)
		.setFooter(`${role.guild.name}`)
		.setTimestamp()
		.setColor(role.hexColor);

	logsChannel.send(rEmbed);

	return delete roleObj[role.id];
};