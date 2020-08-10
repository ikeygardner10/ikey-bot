/* eslint-disable no-unused-vars */
module.exports = async (client, logger, ready) => {

	const servers = client.guilds.cache.size;
	const activities = [
		'+help',
		'+invite',
		`${servers} servers`,
	];

	setInterval(async () => {
		const index = Math.floor(Math.random() * (activities.length - 1) + 1);
		client.user.setActivity(activities[index]);
	}, 10000);

	console.success(`Logged in as ${client.user.tag}!`);
	console.success(`${servers} servers`);

};