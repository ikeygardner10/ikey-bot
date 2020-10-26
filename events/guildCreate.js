const txtFormatter = require('../functions/txtFormatter.js');

module.exports = async (client, guild) => {

	const ngn = txtFormatter(guild.name);
	const non = txtFormatter(guild.owner.user.tag);
	const addGuild = 'INSERT INTO `guilds` (`guildID`, `name`, `joined`, `ownerID`, `ownerName`, `members`, `region`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`= VALUES (`name`), `joined`=true, `members`= VALUES (`members`);';
	const addGuildSettings = 'INSERT INTO `guildsettings` (`guildID`, `prefix`, `maxFamilySize`, `allowIncest`, `invTracking`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `prefix`= VALUES (`prefix`), `allowIncest`= VALUES (`allowIncest`), `invTracking`= VALUES (`invTracking`);';

	console.info('[GUILD CREATE] Guild joined, updating records in database');
	const SQLpool = client.conPool.promise();
	await SQLpool.execute(addGuild, [guild.id, ngn, true, guild.owner.user.id, non, guild.members.cache.size, guild.region, guild.createdAt])
		.then(() => {
			console.success(`[GUILD CREATE] Successfully added/updated record for guild: ${guild.id}`);
			return SQLpool.execute(addGuildSettings, [guild.id, client.config.defaultPrefix, 250, 0, 0])
				.then(() => {
					console.success(`[GUILD CREATE] Successfully added/updated record for guildsettings: ${guild.id}`);
				}).catch((error) => {
					console.error(`[GUILD CREATE] ${error.stack}`);
				});
		}).catch((error) => {
			console.error(`[GUILD CREATE] ${error.stack}`);
		});

	try {
		return client.users.cache.get('341086875232108545').send(`[GUILD JOIN] ${guild.name} (${guild.id}) owned by ${guild.owner.user.tag} (${guild.owner.user.id}). Members: ${guild.members.cache.size}`);
	} catch(error) {
		return console.error(`[GUILD CREATE] ${error.stack}`);
	}
};