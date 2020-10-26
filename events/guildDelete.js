module.exports = async (client, guild) => {

	const updateGuild = 'UPDATE `guilds` SET `joined`= ? WHERE `guildID`= ?';
	const deleteGuildSettings = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `guildsettings` WHERE `guildID`= ?';

	console.info('[GUILD DELETE] Left guild, updating records in database');
	const SQLpool = client.conPool.promise();
	await SQLpool.execute(updateGuild, [false, guild.id])
		.then(() => {
			console.success(`[GUILD DELETE] Successfully updated record for guild: ${guild.id}`);
			return SQLpool.execute(deleteGuildSettings, [guild.id])
				.then(() => {
					console.success(`[GUILD DELETE] Successfully deleted record for guildsettings: ${guild.id}`);
				}).catch((error) => {
					console.error(`[GUILD DELETE] ${error.stack}`);
				});
		}).catch((error) => {
			console.error(`[GUILD DELETE] ${error.stack}`);
		});

	try {
		return client.users.cache.get('341086875232108545').send(`[GUILD DELETE] ${guild.name} (${guild.id}) owned by ${guild.owner.user.tag} (${guild.owner.user.id}).`);
	} catch(error) {
		return console.error(`[GUILD DELETE] ${error.stack}`);
	}
};