const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const createChannel = require('../functions/createChannel');

module.exports = async (client, member) => {


	const updateGuild = 'UPDATE `guilds` SET `members`=? WHERE `guildID`=?;';
	const checkLogSettings = 'SELECT `members`, `userLogs` FROM `logsettings` WHERE `guildID`=?;';
	const getInvites = 'SELECT * FROM `invites` WHERE `guildID`=?;';
	const addInvite = 'INSERT INTO `invites` (`code`, `guildID`, `uses`, `inviterID`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `uses`=?;';

	const SQLpool = client.conPool.promise();

	await SQLpool.execute(updateGuild, [member.guild.members.cache.size, member.guild.id])
		.then(() => {
			console.success(`[GUILD MEMBER ADD] Successfully updated record for guild: ${member.guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD MEMBER ADD] ${error.stack}`);
		});


	const [logRows] = await SQLpool.query(checkLogSettings, [member.guild.id]);
	const [enabled, channel] = [logRows[0].members, logRows[0].userLogs];
	if(enabled === 0) return;

	const [invRows] = await SQLpool.query(getInvites, [member.guild.id]);
	if(!invRows) return;


	let invite = [];
	let invAuthor = [];

	await member.guild.fetchInvites()
		.then(guildInvites => {
			guildInvites.forEach(i => {
				invRows.forEach(row => {
					if(row.code !== i.code) return;
					if(row.guildID !== i.guild.id) return;
					if(row.uses >= i.uses) return;
					if(invite.includes(i)) return;
					invite.push(i);
					invAuthor.push(i.inviter.id);
				});
			});
		});

	if(!invite[0]) {
		invite = client.invArray;
		invAuthor = client.invAuthor;
	}

	const accAge = (Date.now() - member.user.createdAt);
	const inviter = client.users.cache.get(invAuthor[0]);

	const embed = new MessageEmbed()
		.setAuthor('Member Join', member.guild.iconURL())
		.setThumbnail(member.user.avatarURL())
		.setDescription(`**Username:** ${member.user.tag}\n**Acc Age:** ${ms(accAge, { long: true })}\n\n**Invite:** \`discord.gg/${invite[0].code}\`\n**By:** ${inviter.tag}`)
		.setFooter(`ID: ${member.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	let logChannel = await member.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, member.guild, 'user-logs', 'text', 500, 'user-logs', member.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = member.guild.channels.cache.find(ch => ch.name === 'user-logs');
				logChannel.send(embed);
			})
			.catch((error) => {
				console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
			});
	}
	else {
		logChannel.send(embed);
	}

	return SQLpool.execute(addInvite, [invite[0].code, invite[0].guild.id, invite[0].uses || null, invAuthor[0] || null, invite[0].uses])
		.then(() => {
			console.success(`[GUILD MEMBER ADD] Added/updated invite: ${invite[0].code} for guild: ${invite[0].guild.id}`);
		})
		.catch((error) => {
			console.error(`[GUILD MEMBER ADD] ${error.stack}`);
		});

};