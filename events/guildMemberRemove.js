module.exports = (client, member) => {

	const updateGuild = 'UPDATE `guilds` SET `members`= ? WHERE `guildID`= ?';

	console.info('[GUILD MEMBER REMOVE] Connected to database.');
	const SQLpool = client.conPool.promise();
	return SQLpool.execute(updateGuild, [member.guild.members.cache.size, member.guild.id])
		.then(() => {
			console.success(`[GUILD MEMBER REMOVE] Successfully updated record for guild: ${member.guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
		});
};