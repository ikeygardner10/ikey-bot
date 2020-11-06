const { MessageEmbed } = require('discord.js');

module.exports = async (client, guild, user) => {

	const SQLpool = client.conPool.promise();
	const checkTracking = 'SELECT `invTracking`, `logsChannel` FROM `guildsettings` WHERE `guildID`=?;';

	const [rows] = await SQLpool.query(checkTracking, [guild.id]);
	if(rows[0].invTracking === 0) return;

	const channelName = rows[0].logsChannel;
	const logsChannel = guild.channels.cache.find(channel => channel.name === channelName);
	if(!logsChannel) {
		guild.channels.create(channelName, {
			type: 'text',
			position: '500',
			reason: 'logs',
			permissionOverwrites: [
				{
					id: guild.id,
					deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
				}],
		})
			.then(() => {
				console.success(`[GUILD BAN REMOVE] Successfully created logs channel: ${channelName} for guild: ${guild.id}`);
			})
			.catch((error) => {
				console.error(`[GUILD BAN REMOVE] ${error.stack}`);
			});
	}

	const iEmbed = new MessageEmbed()
		.setAuthor('Member Unban', guild.iconURL())
		.setThumbnail(user.avatarURL())
		.setDescription(`**Username:** <@${user.id}> *(${user.tag})*`)
		.setFooter(`ID: ${user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	return logsChannel.send(iEmbed);
};