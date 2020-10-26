const { MessageEmbed } = require('discord.js');

module.exports = async (client, member) => {

	const updateGuild = 'UPDATE `guilds` SET `members`= ? WHERE `guildID`= ?';
	const checkTracking = 'SELECT `invTracking` FROM `guildsettings` WHERE `guildID`=?;';

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

	const logsChannel = member.guild.channels.cache.find(channel => channel.name === 'logs');
	const iEmbed = new MessageEmbed()
		.setAuthor('Member Leave', member.guild.iconURL())
		.setThumbnail(member.user.avatarURL())
		.setDescription(`**Username:** <@${member.user.id}> *(${member.user.tag})*\n`)
		.setFooter(`ID: ${member.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);


	return logsChannel.send(iEmbed);

};