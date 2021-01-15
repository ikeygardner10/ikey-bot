/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const fs = require('fs-extra');

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

		const addGuild = 'INSERT INTO `guilds` (`guildID`, `name`, `joined`, `ownerID`, `ownerName`, `members`, `region`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`=?, `joined`=?, `members`=?';
		const addGuildSettings = 'INSERT INTO `guildsettings` (`guildID`, `prefix`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `guildID`=`guildID`;';
		const addLogSettings = 'INSERT INTO `logsettings` (`guildID`) VALUES (?) ON DUPLICATE KEY UPDATE `guildID`=`guildID`;';

		const SQLpool = client.conPool.promise();

		client.guilds.cache.array().forEach((guild) => {
			const ngn = txtFormatter(guild.name);
			const non = txtFormatter(guild.owner.user.tag);
			return SQLpool.execute(addGuild, [guild.id, ngn, true, guild.owner.user.id, non, guild.members.cache.size, guild.region, guild.createdAt, ngn, true, guild.members.cache.size])
				.then(() => {
					console.success(`[ADD GUILDS] Successfully added/updated record for guild: ${guild.id}`);
					return SQLpool.execute(addGuildSettings, [guild.id, client.config.defaultPrefix])
						.then(() => {
							console.success(`[ADD GUILDS] Successfully added/updated record for guildsettings: ${guild.id}`);
							return SQLpool.execute(addLogSettings, [guild.id])
								.then(() => {
									console.success(`[ADD GUILDS] Successfully added/updated record for logsettings: ${guild.id}`);
								}).catch((error) => {
									console.error(`[ADD GUILDS] ${error.stack}`);
								});
						}).catch((error) => {
							console.error(`[ADD GUILDS] ${error.stack}`);
						});
				}).catch((error) => {
					console.error(`[ADD GUILDS] ${error.stack}`);
				});
		});
	} };
