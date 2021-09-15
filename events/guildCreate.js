const txtFormatter = require('../functions/txtFormatter.js');

module.exports = async (client, guild) => {

	const addGuild = 'INSERT INTO `guilds` (`guildID`, `name`, `joined`, `ownerID`, `ownerName`, `members`, `region`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`=?, `joined`=?, `ownerID`=?, `ownerName`=?, `members`=?, `region`=?;';
	const addGuildSettings = 'INSERT INTO `guildsettings` (`guildID`, `prefix`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `guildID`=?;';
	const addLogSettings = 'INSERT INTO `logsettings` (`guildID`) VALUES (?) ON DUPLICATE KEY UPDATE `guildID`=?;';

	const ngn = txtFormatter(guild.name);
	const non = txtFormatter(guild.owner.user.tag);
	const SQLpool = client.conPool.promise();

	await SQLpool.execute(addGuild, [guild.id, ngn, true, guild.owner.user.id, non, guild.members.cache.size, guild.region, guild.createdAt, ngn, true, guild.owner.user.id, non, guild.members.cache.size, guild.region])
		.then(() => {
			console.success(`[GUILD CREATE] Successfully added/updated record for guild: ${guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD CREATE] ${error.stack}`);
		});

	await SQLpool.execute(addGuildSettings, [guild.id, client.config.defaultPrefix, guild.id])
		.then(() => {
			console.success(`[GUILD CREATE] Successfully added/updated record for guildsettings: ${guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD CREATE] ${error.stack}`);
		});

	await SQLpool.execute(addLogSettings, [guild.id, guild.id])
		.then(() => {
			console.success(`[GUILD CREATE] Successfully added/updated record for logsettings: ${guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD CREATE] ${error.stack}`);
		});


	try {
		return client.channels.cache.get('780252080689774593').send(`[GUILD JOIN] ${guild.name} (${guild.id}) owned by ${guild.owner.user.tag} (${guild.owner.user.id}). Members: ${guild.members.cache.size}`);
	}
	catch(error) {
		return console.error(`[GUILD CREATE] ${error.stack}`);
	}
};