const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const { trueToEnable } = require('../data/arrayData.json');

module.exports = async (client, oldState, newState) => {

	const stmt = 'SELECT `voicechannels`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [rows] = await SQLpool.query(stmt, [newState.guild.id]);
	const [enabled, channel] = [rows[0].voicechannels, rows[0].logChannel];
	if(enabled === 0) return;

	const logChannel = await newState.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		await createChannel(client, newState.guild, channel, 'text', 500, 'logs', channel.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				return console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	const differences = {};
	Object.entries(newState).forEach(([key, value]) => {
		if(oldState[key] === newState[key]) return;
		if(oldState[key] === null && key !== 'channelID') return;
		if(newState[key] === null && key !== 'channelID') return;
		switch(key) {
		case 'serverDeaf':
			return differences['Server Deafened'] = trueToEnable[value];
		case 'serverMute':
			return differences['Server Muted'] = trueToEnable[value];
		case 'selfDeaf':
			return differences['Deafened'] = trueToEnable[value];
		case 'selfMute':
			return differences['Muted'] = trueToEnable[value];
		case 'selfVideo':
			return differences['Enabled Camera'] = trueToEnable[value];
		case 'streaming':
			return differences['Enabled Screen'] = trueToEnable[value];
		case 'channelID':
			differences['Old Channel'] = oldState.channel ? oldState.guild.channels.cache.get(oldState.channel.id) : null;
			return differences['New Channel'] = newState.channel ? newState.guild.channels.cache.get(newState.channel.id) : null;
		default:
		}
	});

	if(Object.keys(differences).length === 0) return;

	const embed = new MessageEmbed()
		.setFooter(`ID: ${newState.channel ? newState.channel.id : oldState.channel.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	const user = await client.users.cache.get(newState.id);

	let desc = `**User:** ${user}\n`;
	Object.entries(differences).forEach(([key, value]) => {
		if(value === null || value === undefined) return;
		return desc += `**${key}:** ${value}\n`;
	});

	embed.setDescription(desc);

	if(oldState.channel === newState.channel) embed.setAuthor('Voice Channel Updated', user.avatarURL());
	if(oldState.channel === null && newState.channel !== null) embed.setAuthor('Voice Channel Joined', user.avatarURL());
	if(oldState.channel !== null && newState.channel !== null && oldState.channel !== newState.channel) embed.setAuthor('Voice Channel Moved', user.avatarURL());
	if(oldState.channel !== null && newState.channel === null) embed.setAuthor('Voice Channel Left', user.avatarURL());

	return logChannel.send(embed);

};