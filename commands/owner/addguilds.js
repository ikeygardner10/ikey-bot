/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const fs = require('fs');

module.exports = {
	config: {
		name: 'addguilds',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 5,
		category: 'owner',
		permissions: 'Bot Owner',
		args: false,
		description: 'Add guilds to DB',
	},
	execute: async (client, message, args) => {

		const addGuild = 'INSERT INTO `guilds` (`guildID`, `name`, `joined`, `ownerID`, `ownerName`, `members`, `region`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`= VALUES (`name`), `joined`=true, `members`= VALUES(`members`)';
		const addGuildSettings = 'INSERT INTO `guildsettings` (`guildID`, `prefix`, `maxFamilySize`, `allowIncest`, `tagDisable`, `nsfwDisable`) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `prefix`= VALUES (`prefix`), `allowIncest`= VALUES (`allowIncest`), `tagDisable`= VALUES (`tagDisable`), `nsfwDisable`= VALUES (`nsfwDisable`)';
		const SQLpool = client.conPool.promise();

		client.guilds.cache.array().forEach((guild) => {
			const ngn = txtFormatter(guild.name);
			const non = txtFormatter(guild.owner.user.tag);
			return SQLpool.execute(addGuild, [guild.id, ngn, true, guild.owner.user.id, non, guild.members.cache.size, guild.region, guild.createdAt])
				.then(() => {
					console.success(`[GUILD CREATE] Successfully added/updated record for guild: ${guild.id}`);
					return SQLpool.execute(addGuildSettings, [guild.id, client.config.defaultPrefix, 250, false, false, false])
						.then(() => {
							console.success(`[GUILD CREATE] Successfully added/updated record for guildsettings: ${guild.id}`);
						}).catch((error) => {
							console.error(`[GUILD CREATE] ${error.stack}`);
						});
				}).catch((error) => {
					console.error(`[GUILD CREATE] ${error.stack}`);
				});
		});
	} };
