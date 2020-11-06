const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = async (client, member) => {

	const updateGuild = 'UPDATE `guilds` SET `members`= ? WHERE `guildID`= ?;';
	const checkTracking = 'SELECT `invTracking`, `logsChannel` FROM `guildsettings` WHERE `guildID`=?;';
	const getInvites = 'SELECT * FROM `invites` WHERE `guildID`=?;';
	const addInvite = 'INSERT INTO `invites` (`code`, `guildID`, `uses`, `inviterID`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `uses`= VALUES (`uses`);';

	console.info('[GUILD MEMBER ADD] Connected to database.');
	const SQLpool = client.conPool.promise();
	await SQLpool.execute(updateGuild, [member.guild.members.cache.size, member.guild.id])
		.then(() => {
			console.success(`[GUILD MEMBER ADD] Successfully updated record for guild: ${member.guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD MEMBER ADD] ${error.stack}`);
		});

	const [trckRows] = await SQLpool.query(checkTracking, [member.guild.id]);
	if(trckRows[0].invTracking === 0) return;
	const channelName = trckRows[0].logsChannel;

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

	const inviter = client.users.cache.get(invAuthor[0]);
	const accAge = (Date.now() - member.user.createdAt);
	const logsChannel = member.guild.channels.cache.find(channel => channel.name === channelName);
	const iEmbed = new MessageEmbed()
		.setAuthor('New Member', member.guild.iconURL())
		.setThumbnail(member.user.avatarURL())
		.setDescription(`**Username:** <@${member.user.id}> *(${member.user.tag})*\n**Acc Age:** ${ms(accAge, { long: true })}\n\n**Invite Code:** \`discord.gg/${invite[0].code}\`\n**Invite Author:** ${inviter.tag}\n**Times Used:** ${invite[0].uses || '1'}`)
		.setFooter(`ID: ${member.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	if(!logsChannel) {
		member.guild.channels.create(channelName, {
			type: 'text',
			position: '500',
			reason: 'logs',
			permissionOverwrites: [
				{
					id: member.guild.id,
					deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
				}],
		})
			.then(() => {
				console.success(`[GUILD MEMBER ADD] Successfully created logs channel: ${channelName} for guild: ${member.guild.id}`);
			})
			.catch((error) => {
				console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	logsChannel.send(iEmbed);

	return SQLpool.execute(addInvite, [invite[0].code, invite[0].guild.id, invite[0].uses || null, invAuthor[0] || null])
		.then(() => {
			console.success(`[GUILD MEMBER ADD] Added/updated invite: ${invite[0].code} for guild: ${invite[0].guild.id}`);
		})
		.catch((error) => {
			console.error(`[GUILD MEMBER ADD] ${error.stack}`);
		});

};