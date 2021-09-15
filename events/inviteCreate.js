const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const createChannel = require('../functions/createChannel');

module.exports = async (client, invite) => {

	const addInvite = 'INSERT INTO `invites` (`code`, `guildID`, `uses`, `inviterID`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `uses`=?;';
	const checkTracking = 'SELECT `invites`, `serverLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	const [enabled, channel] = [logRows[0].invites, logRows[0].serverLogs];
	if(enabled === 0) return;

	let maxAge = invite.maxAge;
	switch(maxAge) {
	case 0:
		maxAge = 'Never';
		break;
	default:
		maxAge = ms(maxAge * 1000);
		break;
	}

	let maxUses = invite.maxUses;
	switch(maxUses) {
	case 0:
		maxUses = 'Unlimited';
		break;
	}

	const temp = invite.temporary ? 'Yes' : 'No';
	const code = `discord.gg/${invite.code}`;

	const inviter = client.users.cache.get(invite.inviter.id);
	const channelName = invite.guild.channels.cache.get(invite.channel.id).name;

	const embed = new MessageEmbed()
		.setAuthor('New Invite', invite.guild.iconURL())
		.setDescription(`**Code:** \`${code}\`\n**Author:** ${inviter.tag}\n\n**Channel:** \`#${channelName}\`\n**Expires:** ${maxAge}\n**Max. Uses:** ${maxUses}\n**Temporary:** ${temp}`)
		.setFooter(`${invite.guild.name}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	let logChannel = await invite.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, invite.guild, 'server-logs', 'text', 500, 'server-logs', invite.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = invite.guild.channels.cache.find(ch => ch.name === 'server-logs');
				logChannel.send(embed);
			})
			.catch((error) => {
				console.error(`[INVITE CREATE] ${error.stack}`);
			});
	}
	else {
		await logChannel.send(embed);
	}

	return SQLpool.execute(addInvite, [invite.code, invite.guild.id, invite.uses, invite.inviter.id, invite.uses])
		.then(() => {
			console.success(`[INV CREATE] Successfully added invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};