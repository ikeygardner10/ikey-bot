/* eslint-disable no-unused-vars */
const wait = require('util').promisify(setTimeout);
const addInvites = require('../functions/addInvites');
const botStatus = require('../functions/botStatus');

const clientActivities = [
	'fiftyzu x tkdwn. - Kamikaze', 'Inhale (Feat. GRiMM Doza) [Prod. Ricky Reasonz & GRiMM Doza]',
	'fuzgod - hound dog [prod. drippy]', '#MasterRoshiFingerRoll [Prod. GRiMM Doza x Ricky Reasonz]',
	'TUAMIE - Raw Cashews', 'Wun Two - winter in rio',
];

const activitySettings = [
	{ url: 'https://www.youtube.com/watch?v=TYStOJ25T60', type: 'STREAMING' }, { url: 'https://www.youtube.com/watch?v=Eof2scqapsI', type: 'STREAMING' },
	{ url: 'https://www.youtube.com/watch?v=pc7LAxRgRIQ', type: 'STREAMING' }, { url: 'https://www.youtube.com/watch?v=aIaEmG_XRQw', type: 'STREAMING' },
	{ url: 'https://www.youtube.com/watch?v=iYrfikKvhFA', type: 'STREAMING' }, { url: 'https://www.youtube.com/watch?v=on2SvsO1s0E', type: 'STREAMING' },
];

module.exports = async (client, ready) => {

	const servers = client.guilds.cache.size;
	const SQLpool = client.conPool.promise();
	const checkTracking = 'SELECT `guildID` FROM `guildsettings` WHERE `invTracking`=?;';
	const truncateInvites = 'SET SQL_SAFE_UPDATES=0; TRUNCATE TABLE `invites`;';
	const selectJoinedGuilds = 'SELECT * FROM `guilds` WHERE `joined`=1;';
	const selectGuildSettings = 'SELECT * FROM `guildsettings` WHERE `guildID`=?;';

	await wait(1000);
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

	await wait(1000);

	console.success(`Logged in as ${client.user.tag}!`);
	console.success(`${servers} servers`);
	console.success(`Loaded invites for ${trckRows.length} guild(s)`);
	console.success(`Loaded prefixes for ${guildRows.length} guild(s)`);


	botStatus(client);
	// setInterval(() => {
	// 	const index = Math.floor(Math.random() * (clientActivities.length - 1) + 1);
	// 	client.user.setActivity(clientActivities[index], activitySettings[index]);
	// }, 60000);

};