const wait = require('util').promisify(setTimeout);
const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, invite) => {

	const deleteInvite = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `invites` WHERE `code`=? AND `guildID`=?;';
	const selectInvite = 'SELECT * FROM `invites` WHERE `code`=? AND `guildID`=?;';
	const checkTracking = 'SELECT `invites`, `serverLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	const [enabled, channel] = [logRows[0].invites, logRows[0].serverLogs];
	if(enabled === 0) return;

	const [invRow] = await SQLpool.query(selectInvite, [invite.code, invite.guild.id]);
	if(!invRow[0]) return;

	const invArray = [];
	invArray.push(invite);
	client.invArray = invArray;

	const invAuthor = [];
	invAuthor.push(invRow[0].inviterID);
	client.invAuthor = invAuthor;

	const inviter = client.users.cache.get(invAuthor[0]);

	const embed = new MessageEmbed()
		.setAuthor('Invite Deleted', invite.guild.iconURL())
		.setDescription(`**Code:** \`discord.gg/${invite.code}\`\n**Author:** ${inviter.tag}\n**Used:** ${invRow[0].uses || '0 - 1'}`)
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
				console.error(`[INVITE DELETE] ${error.stack}`);
			});
	}
	else {
		await logChannel.send(embed);
	}

	await wait(1000 * 15);

	return SQLpool.query(deleteInvite, [invite.code, invite.guild.id])
		.then(() => {
			console.success(`[INVITE DELETE] Successfully deleted invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};