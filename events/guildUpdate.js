const txtFormatter = require('../functions/txtFormatter.js');
const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const ms = require('ms');
const { verification, region } = require('../data/arrayData.json');

module.exports = async (client, oldGuild, newGuild) => {

	const guild = newGuild;
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
			return differences['AFK Channel'] = guild.channels.cache.get(value).name;
		case 'afkTimeout':
			if(oldGuild[key] === newGuild[key]) return;
			if(value === 0) return differences['AFK Timeout'] = 'None';
			return differences['AFK Timeout'] = ms(value * 1000);
		case 'systemChannelID':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['Welcome Channel'] = guild.channels.cache.get(value).name;
		case 'verificationLevel':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['Verification Level'] = verification[value];
		case 'region':
			if(oldGuild[key] === newGuild[key]) return;
			return differences['Region'] = region[value];
		default:
			return;
		}
	});

	if(Object.keys(differences).length === 0) return;

	const stmt = 'SELECT `server`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [guild.id]);
	const [enabled, channel] = [rows[0].server, rows[0].logChannel];
	if(enabled !== 0) {

		const logChannel = await guild.channels.cache.find(ch => ch.name === channel);
		if(!logChannel) {
			await createChannel(client, guild, channel, 'text', 500, 'logs', guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
				.catch((error) => {
					return console.error(`[GUILD MEMBER ADD] ${error.stack}`);
				});
		}

		const embed = new MessageEmbed()
			.setAuthor('Server Updated', guild.iconURL())
			.setThumbnail(guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
			.setTimestamp()
			.setColor(0xFFFFFA);

		let desc = '';
		Object.entries(differences).forEach(([key, value]) => {
			desc += `**${key}:** ${value}\n`;
		});

		embed.setDescription(desc);
		embed.setFooter(`Server ID: ${guild.id}`);

		await logChannel.send(embed);
	}

	const ngn = txtFormatter(guild.name);
	const non = txtFormatter(guild.owner.user.tag);
	const addGuild = 'INSERT INTO `guilds` (`guildID`, `name`, `joined`, `ownerID`, `ownerName`, `members`, `region`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name`= VALUES (`name`), `joined`=true, `members`= VALUES (`members`);';

	console.info('[GUILD UPDATE] Guild updated, updating records in database');
	await SQLpool.execute(addGuild, [guild.id, ngn, true, guild.owner.user.id, non, guild.members.cache.size, guild.region, guild.createdAt])
		.then(() => {
			console.success(`[GUILD UPDATE] Successfully added/updated record for guild: ${guild.id}`);
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