const wait = require('util').promisify(setTimeout);
const { MessageEmbed } = require('discord.js');

module.exports = async (client, invite) => {

	const SQLpool = client.conPool.promise();
	const deleteInvite = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `invites` WHERE `code`=? AND `guildID`=?;';
	const selectInvite = 'SELECT * FROM `invites` WHERE `code`=? AND `guildID`=?;';
	const checkTracking = 'SELECT `invTracking`, `logsChannel` FROM `guildsettings` WHERE `guildID`=?;';

	const [trckRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	if(trckRows[0].invTracking === 0) return;

	const [invRow] = await SQLpool.query(selectInvite, [invite.code, invite.guild.id]);
	if(!invRow[0]) return;

	const invArray = [];
	invArray.push(invite);
	client.invArray = invArray;

	const invAuthor = [];
	invAuthor.push(invRow[0].inviterID);
	client.invAuthor = invAuthor;
	const inviter = client.users.cache.get(invAuthor[0]);

	const channelName = trckRows[0].logsChannel;
	const logsChannel = invite.guild.channels.cache.find(channel => channel.name === channelName);
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
				console.success(`[INV DELETE] Successfully created logs channel: ${channelName} for guild: ${invite.guild.id}`);
			})
			.catch((error) => {
				console.error(`[INV DELETE] ${error.stack}`);
			});
	}

	const iEmbed = new MessageEmbed()
		.setAuthor('Invite Deleted', invite.guild.iconURL())
		.setDescription(`**Invite Code:** \`discord.gg/${invite.code}\`\n**Invite Author:** ${inviter.tag}\n**Times Used:** ${invRow[0].uses || '0 - 1'}`)
		.setFooter(`${invite.guild.name}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	logsChannel.send(iEmbed);

	await wait(1000 * 30);

	return SQLpool.query(deleteInvite, [invite.code, invite.guild.id])
		.then(() => {
			console.success(`[INV DEL] Successfully deleted invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};