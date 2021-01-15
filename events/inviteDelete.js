const wait = require('util').promisify(setTimeout);
const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

module.exports = async (client, invite) => {


	const deleteInvite = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `invites` WHERE `code`=? AND `guildID`=?;';
	const selectInvite = 'SELECT * FROM `invites` WHERE `code`=? AND `guildID`=?;';
	const checkTracking = 'SELECT `invites`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [invite.guild.id]);
	const [invites, channel] = [logRows[0].invites, logRows[0].logChannel];
	if(invites === 0) return;

	const [invRow] = await SQLpool.query(selectInvite, [invite.code, invite.guild.id]);
	if(!invRow[0]) return;


	const invArray = [];
	invArray.push(invite);
	client.invArray = invArray;

	const invAuthor = [];
	invAuthor.push(invRow[0].inviterID);
	client.invAuthor = invAuthor;


	const inviter = client.users.cache.get(invAuthor[0]);
	const logsChannel = invite.guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, invite.guild, channel, 'text', 500, 'logs', invite.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}


	const iEmbed = new MessageEmbed()
		.setAuthor('Invite Deleted', invite.guild.iconURL())
		.setDescription(`**Code:** \`discord.gg/${invite.code}\`\n**Author:** ${inviter.tag}\n**Used:** ${invRow[0].uses || '0 - 1'}`)
		.setFooter(`${invite.guild.name}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	logsChannel.send(iEmbed);


	await wait(1000 * 15);

	return SQLpool.query(deleteInvite, [invite.code, invite.guild.id])
		.then(() => {
			console.success(`[INV DEL] Successfully deleted invite: ${invite.code} for guild: ${invite.guild.id}`);
		})
		.catch((error) => {
			return console.error(error.stack);
		});

};