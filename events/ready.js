/* eslint-disable no-unused-vars */
const wait = require('util').promisify(setTimeout);
const addInvites = require('../functions/addInvites');

module.exports = async (client, ready) => {

	const servers = client.guilds.cache.size;
	const activities = [
		'+help',
		'+invite',
		`${servers} servers`,
	];
	const SQLpool = client.conPool.promise();
	const checkTracking = 'SELECT `guildID` FROM `guildsettings` WHERE `invTracking`=?;';
	const truncateInvites = 'SET SQL_SAFE_UPDATES=0; TRUNCATE TABLE `invites`;';

	setInterval(async () => {
		const index = Math.floor(Math.random() * (activities.length - 1) + 1);
		client.user.setActivity(activities[index]);
	}, 10000);

	await wait(1500);
	const [rows] = await SQLpool.query(checkTracking, [true]);

	await SQLpool.query(truncateInvites)
		.then(() => {
			rows.forEach(row => {
				addInvites(client, row.guildID);
			});
		})
		.catch((error) => {
			console.error(`[READY] ${error.stack}`);
		});

	console.success(`Logged in as ${client.user.tag}!`);
	console.success(`${servers} servers`);
	console.success(`Loaded invites for ${rows.length} guild(s)`);

};