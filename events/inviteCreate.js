const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = async (client, invite) => {

	const SQLpool = client.conPool.promise();
	const addInvite = 'INSERT INTO `invites` (`code`, `guildID`, `uses`, `inviterID`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `uses`= VALUES (`uses`);';
	const checkTracking = 'SELECT `invTracking`, `logsChannel` FROM `guildsettings` WHERE `guildID`=?;';

	const [trckRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	if(trckRows[0].invTracking === 0) return;

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
	if(maxUses === 0) maxUses = 'Unlimited';

	const code = `discord.gg/${invite.code}`;
	const inviter = client.users.cache.get(invite.inviter.id);
	const temp = invite.temporary ? 'Yes' : 'No';
	const channel = invite.guild.channels.cache.get(invite.channel.id).name;

	const channelName = trckRows[0].logsChannel;
	const logsChannel = invite.guild.channels.cache.find(c => c.name === channelName);
	if(!logsChannel) {
		invite.guild.channels.create(channelName, {
			type: 'text',
			position: '500',
			reason: 'logs',
			permissionOverwrites: [
				{
					id: invite.guild.id,
					deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
				}],
		})
			.then(() => {
				console.success(`[INV CREATE] Successfully created logs channel: ${channelName} for guild: ${invite.guild.id}`);
			})
			.catch((error) => {
				console.error(`[INV CREATE] ${error.stack}`);
			});
	}

	const iEmbed = new MessageEmbed()
		.setAuthor('New Invite', invite.guild.iconURL())
		.setDescription(`**Invite Code:** \`${code}\`\n**Invite Author:** ${inviter.tag}\n\n**Channel:** \`#${channel}\`\n**Expires:** ${maxAge}\n**Max. Uses:** ${maxUses}\n**Temporary:** ${temp}`)
		.setFooter(`${invite.guild.name}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	logsChannel.send(iEmbed);

	return SQLpool.execute(addInvite, [invite.code, invite.guild.id, invite.uses || null, invite.inviter.id || null])
		.then(() => {
			console.success(`[INV CREATE] Successfully added invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};