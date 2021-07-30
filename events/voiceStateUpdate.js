const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');

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

	const embed = new MessageEmbed()
		.setTimestamp()
		.setColor(0xFFFFFA);

	const user = await client.users.cache.get(newState.id);
	const serverMuted = newState.serverMute ? 'Yes' : 'No';

	if(oldState.channel === null && newState.channel !== null) {
		const newChannel = await newState.guild.channels.cache.get(newState.channel.id).name;
		embed.setAuthor('User Joined VC', newState.guild.iconURL());
		embed.setDescription(`**User:** ${user}\n**Channel:** ${newChannel}\n**Server Muted:** ${serverMuted}`);
		embed.setFooter(`User ID: ${newState.id}\nChannel ID: ${newState.channel.id}`);
	}
	else if(oldState.channel !== null && newState.channel !== null && oldState.channel !== newState.channel) {
		const oldChannel = await oldState.guild.channels.cache.get(oldState.channel.id).name;
		const newChannel = await newState.guild.channels.cache.get(newState.channel.id).name;
		embed.setAuthor('User Moved VC', newState.guild.iconURL());
		embed.setDescription(`**User:** ${user}\n**Old Channel:** ${oldChannel}\n**New Channel:** ${newChannel}\n**Server Muted:** ${serverMuted}`);
		embed.setFooter(`User ID: ${newState.id}\nChannel ID: ${newState.channel.id}`);
	}
	else if(oldState.channel !== null && newState.channel === null) {
		const oldChannel = await oldState.guild.channels.cache.get(oldState.channel.id).name;
		embed.setAuthor('User Left VC', oldState.guild.iconURL());
		embed.setDescription(`**User:** ${user}\n**Channel:** ${oldChannel}`);
		embed.setFooter(`User ID: ${oldState.id}\nChannel ID: ${oldState.channel.id}`);
	}

	return logChannel.send(embed);

};