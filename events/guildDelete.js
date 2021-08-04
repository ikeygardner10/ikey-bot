module.exports = async (client, guild) => {

	const updateGuild = 'UPDATE `guilds` SET `joined`=0 WHERE `guildID`= ?;';
	const updateLogSettings = 'UPDATE `logsettings` SET `channels`=0, `commands`=0, `invites`=0, `members`=0, `messages`=0, `roles`=0, `server`=0, `voice`=0 WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();

	await SQLpool.execute(updateGuild, [guild.id])
		.then(() => {
			console.success(`[GUILD DELETE] Successfully updated record for guild: ${guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD DELETE] ${error.stack}`);
		});

	await SQLpool.query(updateLogSettings, [guild.id])
		.then(() => {
			console.success(`[GUILD DELETE] Successfully updated record for logsettings: ${guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD DELETE] ${error.stack}`);
		});

	try {
		return client.channels.cache.get('780252080689774593').send(`[GUILD DELETE] ${guild.name} (${guild.id}) owned by ${guild.owner.user.tag} (${guild.owner.user.id}).`);
	}
	catch(error) {
		return console.error(`[GUILD DELETE] ${error.stack}`);
	}
};