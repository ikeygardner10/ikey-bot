const { MessageEmbed } = require('discord.js');
const wait = require('util').promisify(setTimeout);
const createChannel = require('../functions/createChannel');

module.exports = async (client, member) => {


	const updateGuild = 'UPDATE `guilds` SET `members`=? WHERE `guildID`=?;';
	const checkLogSettings = 'SELECT `members`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();

	await SQLpool.execute(updateGuild, [member.guild.members.cache.size, member.guild.id])
		.then(() => {
			console.success(`[GUILD MEMBER REMOVE] Successfully updated record for guild: ${member.guild.id}`);
		}).catch((error) => {
			console.error(`[GUILD MEMBER REMOVE] ${error.stack}`);
		});


	await wait(1500);

	const [logRows] = await SQLpool.query(checkLogSettings, [member.guild.id]);
	const [members, channel] = [logRows[0].members, logRows[0].logChannel];
	if(members === 0) return;


	const checkBan = await member.guild.fetchBans()
		.then(bans => {
			if(bans.some(u => member.id.includes(u.user.id))) {
				return true;
			} else {
				return false;
			}
		});
	if(checkBan) return;


	const logsChannel = member.guild.channels.cache.find(ch => ch.name === channel);
	if(!logsChannel) {
		await createChannel(client, member.guild, channel, 'text', 500, 'logs', member.guild.id, [], ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.catch((error) => {
				console.error(`[GUILD MEMBER ADD] ${error.stack}`);
			});
	}

	const iEmbed = new MessageEmbed()
		.setAuthor('Member Leave', member.guild.iconURL())
		.setThumbnail(member.user.avatarURL())
		.setDescription(`**Username:** ${member.user.tag}`)
		.setFooter(`ID: ${member.user.id}`)
		.setTimestamp()
		.setColor(0xFFFFFA);

	return logsChannel.send(iEmbed);

};