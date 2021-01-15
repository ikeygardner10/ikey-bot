const txtFormatter = require('../functions/txtFormatter.js');

module.exports = async (client, oldGuild, newGuild) => {

	const guild = newGuild;
	const ngn = txtFormatter(guild.name);
	const non = txtFormatter(guild.owner.user.tag);
	const addGuild = 'INSERT INTO `guilds` (`guildID`, `name`, `joined`, `ownerID`, `ownerName`, `members`, `region`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`= VALUES (`name`), `joined`=true, `members`= VALUES (`members`);';

	const differences = {};
	Object.entries(oldGuild).forEach(([key, value]) => {
		switch(key) {
		case 'name':
			if(oldGuild[key] === newGuild[key]) return;
			return differences[key] = value;

		case 'ownerID':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['owner name'] = `${oldGuild.owner.user.tag} (${oldGuild.owner.user.id})`;

		case 'region':
			if(oldGuild[key] === newGuild[key]) return;
			return differences[key] = value;

		default:
			return;
		}
	});

	if(Object.keys(differences).length === 0) return;

	console.info('[GUILD UPDATE] Guild updated, updating records in database');
	const SQLpool = client.conPool.promise();
	await SQLpool.execute(addGuild, [guild.id, ngn, true, guild.owner.user.id, non, guild.members.cache.size, guild.region, guild.createdAt])
		.then(() => {
			console.success(`[GUILD UPDATE] Successfully added/updated record for guild: ${guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD UPDATE] ${error.stack}`);
		});

	let msg = `[GUILD UPDATE] ${newGuild.name} (${newGuild.id}) owned by ${newGuild.owner.user.tag} (${newGuild.owner.user.id}).`;
	Object.entries(differences).forEach(([key, value]) => {
		msg += `\t\n- Old ${key}: *${value}*`;
	});

	try {
		return client.channels.cache.get('780252080689774593').send(msg);
	} catch(error) {
		return console.error(`[GUILD CREATE] ${error.stack}`);
	}
};