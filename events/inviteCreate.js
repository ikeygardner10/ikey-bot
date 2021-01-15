const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const createChannel = require('../functions/createChannel');

module.exports = async (client, invite) => {


	const addInvite = 'INSERT INTO `invites` (`code`, `guildID`, `uses`, `inviterID`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `uses`=?;';
	const checkTracking = 'SELECT `invites`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	const [invites, channel] = [logRows[0].invites, logRows[0].logChannel];
	if(invites === 0) return;


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


	const logsChannel = invite.guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, invite.guild, channel, 'text', 500, 'logs', invite.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}


	const iEmbed = new MessageEmbed()
		.setAuthor('New Invite', invite.guild.iconURL())
		.setDescription(`**Code:** \`${code}\`\n**Author:** ${inviter.tag}\n\n**Channel:** \`#${channelName}\`\n**Expires:** ${maxAge}\n**Max. Uses:** ${maxUses}\n**Temporary:** ${temp}`)
		.setFooter(`${invite.guild.name}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	logsChannel.send(iEmbed);


	return SQLpool.execute(addInvite, [invite.code, invite.guild.id, invite.uses, invite.inviter.id, invite.uses])
		.then(() => {
			console.success(`[INV CREATE] Successfully added invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};