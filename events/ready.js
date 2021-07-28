/* eslint-disable no-unused-vars */
const wait = require('util').promisify(setTimeout);
const addInvites = require('../functions/addInvites');
const botStatus = require('../functions/botStatus');

module.exports = async (client, ready) => {

	const checkTracking = 'SELECT `guildID` FROM `logsettings` WHERE `invites`=?;';
	const truncateInvites = 'SET SQL_SAFE_UPDATES=0; TRUNCATE TABLE `invites`;';
	const selectJoinedGuilds = 'SELECT * FROM `guilds` WHERE `joined`=1;';
	const selectGuildSettings = 'SELECT * FROM `guildsettings` WHERE `guildID`=?;';

	const stmt = 'SELECT `guildID` FROM `logsettings` WHERE `messages`=?;';

	await wait(1500);

	const SQLpool = client.conPool.promise();
	const [trckRows] = await SQLpool.query(checkTracking, [true]);

	await SQLpool.query(truncateInvites)
		.then(() => {
			trckRows.forEach(row => {
				addInvites(client, row.guildID);
			});
		})
		.catch((error) => {
			console.error(`[READY] ${error.stack}`);
		});

	await wait(1500);

	const [guildRows] = await SQLpool.query(selectJoinedGuilds);
	await guildRows.forEach(async guild => {
		await SQLpool.query(selectGuildSettings, [guild.guildID])
			.then(async ([row]) => {
				await client.prefixes.set(guild.guildID, row[0].prefix);
				return console.info(`[READY] Loaded prefix: ${row[0].prefix} for guild: ${guild.guildID}`);
			})
			.catch(async (error) => {
				await client.prefixes.set(guild.guildID, client.config.defaultPrefix);
				return console.warn(`Failed to load prefix for guild: ${guild.guildID}, loaded defaults`);
			});
	});

	await wait(1500);

	const [rows] = await SQLpool.execute(stmt, [true]);
	await rows.forEach(async row => {
		const guild = await client.guilds.fetch(row.guildID);
		await guild.channels.cache.forEach(async channel => {
			if(channel.type !== 'text') return;
			if(channel.permissionsFor(client.user).has('VIEW_CHANNEL') === false) return;
			await channel.messages.fetch({ limit: 100 }, true, true);
			await wait(1000);
		});
	});

	await wait(1500);

	console.success(`Logged in as ${client.user.tag}!`);
	console.success(`${client.guilds.cache.size} servers`);
	console.success(`Loaded invites for ${trckRows.length} guild(s)`);
	console.success(`Loaded prefixes for ${guildRows.length} guild(s)`);


	botStatus(client);

};