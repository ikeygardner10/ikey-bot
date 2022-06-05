/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const fs = require('fs-extra');

module.exports = {
	config: {
		name: 'deletefamily',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 5,
		category: 'owner',
		permissions: 'Bot Owner',
		args: false,
		description: 'Removes dead users from family trees',
	},
	execute: async (client, message, args) => {

		const SQLpool = client.conPool.promise();

		const [marriages] = await SQLpool.query('SELECT * FROM `marriages`;');
		const [adoptions] = await SQLpool.query('SELECT * FROM `adoptions`;');

		console.info('[DEL FAM CMD] Querying database for all marriages');
		await marriages.forEach(row => {
			try {
				console.info(`[DEL FAM CMD] Query guild: ${row.guildID} for user: ${row.userID}`);
				client.guilds.cache.get(row.guildID).members.fetch(row.userID);
			}
			catch {
				console.info(`[DEL FAM CMD] No user: ${row.userID} in guild: ${row.guildID}, deleting entries`);
				SQLpool.query('SET SQL_SAFE_UPDATES=0; DELETE FROM `marriages` WHERE `familyID`=? AND `guildID`=?;', [row.familyID, row.guildID]);
				SQLpool.query('SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;', [row.familyID, row.guildID]);
				console.success(`[DEL FAM CMD] Entries for user: ${row.userID} & family: ${row.familyID} in guild: ${row.guildID} deleted`);
			}
			try {
				console.info(`[DEL FAM CMD] Querying guild: ${row.partnerID} for user: ${row.userID}`);
				client.guilds.cache.get(row.guildID).members.fetch(row.partnerID);
			}
			catch {
				console.info(`[DEL FAM CMD] No user: ${row.partnerID} in guild: ${row.guildID}, deleting entries`);
				SQLpool.query('SET SQL_SAFE_UPDATES=0; DELETE FROM `marriages` WHERE `familyID`=? AND `guildID`=?;', [row.familyID, row.guildID]);
				SQLpool.query('SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;', [row.familyID, row.guildID]);
				console.success(`[DEL FAM CMD] Entries for user: ${row.partnerID} & family: ${row.familyID} in guild: ${row.guildID} deleted`);
			}
		});

		console.info('[DEL FAM CMD] Querying database for all adoptions');
		await adoptions.forEach(row => {
			try {
				console.info(`[DEL FAM CMD] Query guild: ${row.guildID} for user: ${row.childID}`);
				client.guilds.cache.get(row.guildID).members.fetch(row.childID);
			}
			catch {
				console.info(`[DEL FAM CMD] No user: ${row.childID} in guild: ${row.guildID}, deleting entries`);
				SQLpool.query('SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `childID`=? AND `guildID`=?;', [row.childID, row.guildID]);
				console.success(`[DEL FAM CMD] Entries for user: ${row.childID} in guild: ${row.guildID} deleted`);
			}
		});

		return;

	} };
