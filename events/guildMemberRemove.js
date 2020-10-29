const { MessageEmbed } = require('discord.js');

module.exports = async (client, member) => {

	const updateGuild = 'UPDATE `guilds` SET `members`= ? WHERE `guildID`= ?';
	const checkTracking = 'SELECT `invTracking`, `logsChannel` FROM `guildsettings` WHERE `guildID`=?;';

	console.info('[GUILD MEMBER REMOVE] Connected to database.');
	const SQLpool = client.conPool.promise();
	await SQLpool.execute(updateGuild, [member.guild.members.cache.size, member.guild.id])
		.then(() => {
			console.success(`[GUILD MEMBER REMOVE] Successfully updated record for guild: ${member.guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
		});

	const [rows] = await SQLpool.query(checkTracking, [member.guild.id]);
	if(rows[0].invTracking === 0) return;
	const channelName = rows[0].logsChannel;

	const iEmbed = new MessageEmbed()
		.setAuthor('Member Leave', member.guild.iconURL())
		.setThumbnail(member.user.avatarURL())
		.setDescription(`**Username:** <@${member.user.id}> *(${member.user.tag})*\n`)
		.setFooter(`ID: ${member.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	const logsChannel = member.guild.channels.cache.find(channel => channel.name === channelName);
	if(!logsChannel) {
		member.guild.channels.create(channelName, {
			type: 'text',
			position: '1',
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

	return logsChannel.send(iEmbed);

};