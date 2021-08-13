const txtFormatter = require('../functions/txtFormatter.js');
const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const ms = require('ms');
const { verification, region } = require('../data/arrayData.json');

module.exports = async (client, oldGuild, newGuild) => {

	const differences = {};
	Object.entries(newGuild).forEach(([key, value]) => {
		switch(key) {
		case 'name':
			if(oldGuild[key] === newGuild[key]) return;
			differences['New Name'] = newGuild.name;
			return differences['Old Name'] = oldGuild.name;
		case 'ownerID':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['Owner'] = `${newGuild.owner.user.tag} (${newGuild.owner.user.id})`;
		case 'afkChannelID':
			if(oldGuild[key] === newGuild[key]) return;
			if(value === null) return differences['AFK Channel'] = 'None';
			return differences['AFK Channel'] = newGuild.channels.cache.get(value).name;
		case 'afkTimeout':
			if(oldGuild[key] === newGuild[key]) return;
			if(value === 0) return differences['AFK Timeout'] = 'None';
			return differences['AFK Timeout'] = ms(value * 1000);
		case 'systemChannelID':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['Welcome Channel'] = newGuild.channels.cache.get(value).name;
		case 'verificationLevel':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['Verification Level'] = verification[value];
		case 'region':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['Region'] = region[value];
		case 'banner':
			return;
		default:
			return;
		}
	});

	if(Object.keys(differences).length === 0) return;

	const stmt = 'SELECT `server`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [newGuild.id]);
	const [enabled, channel] = [rows[0].server, rows[0].logChannel];
	if(enabled !== 0) {

		const logChannel = await newGuild.channels.cache.find(ch => ch.name === channel);
		if(!logChannel) {
			await createChannel(client, newGuild, channel, 'text', 500, 'logs', newGuild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
				.catch((error) => {
					return console.error(`[GUILD MEMBER ADD] ${error.stack}`);
				});
		}

		const embed = new MessageEmbed()
			.setAuthor('Server Updated', newGuild.iconURL())
			.setThumbnail(newGuild.iconURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`Server ID: ${newGuild.id}`)
			.setTimestamp()
			.setColor(0xFFFFFA);

		let desc = '';
		Object.entries(differences).forEach(([key, value]) => {
			desc += `**${key}:** ${value}\n`;
		});

		embed.setDescription(desc);

		await logChannel.send(embed);

	}

	const ngn = txtFormatter(newGuild.name);
	const non = txtFormatter(newGuild.owner.user.tag);
	const addGuild = 'INSERT INTO `guilds` (`guildID`, `name`, `joined`, `ownerID`, `ownerName`, `members`, `region`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`= VALUES (`name`), `joined`=true, `members`= VALUES (`members`);';

	console.info('[GUILD UPDATE] Guild updated, updating records in database');
	await SQLpool.execute(addGuild, [newGuild.id, ngn, true, newGuild.owner.user.id, non, newGuild.members.cache.size, newGuild.region, newGuild.createdAt])
		.then(() => {
			console.success(`[GUILD UPDATE] Successfully added/updated record for guild: ${newGuild.id}`);
		}).catch((error) => {
			console.error(`[GUILD UPDATE] ${error.stack}`);
		});

	let msg = `[GUILD UPDATE] ${oldGuild.name} (${oldGuild.id}) owned by ${oldGuild.owner.user.tag} (${oldGuild.owner.user.id}).`;
	Object.entries(differences).forEach(([key, value]) => {
		if(key !== 'name' || key !== 'ownerID' || key !== 'region') return;
		msg += `\t\n- ${key}: *${value}*`;
	});

	try {
		client.channels.cache.get('780252080689774593').send(msg);
	}
	catch(error) {
		return console.error(`[GUILD CREATE] ${error.stack}`);
	}
};