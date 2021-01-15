const { MessageEmbed } = require('discord.js');
const addInvites = require('../../functions/addInvites');
const createChannel = require('../../functions/createChannel');

module.exports = {
	config: {
		name: 'logs',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<option>/all channel-name(optional)',
		cooldown: 5,
		category: 'logs',
		permissions: 'Manage Server',
		args: false,
		description: 'Disable/enable logs\n**Options:**\nchannels\ncommands\ninvites\nmembers\nmessages\nroles\nserver\nvoice',
	},
	execute: async (client, message, args) => {

		const checkLogSettings = 'SELECT `channels`, `commands`, `invites`, `members`, `messages`, `roles`, `server`, `voice`, `logChannel` FROM `logsettings` WHERE `guildID`=?;';
		let updateLogSettings = 'UPDATE `logsettings` SET `channels`=?,`commands`=?,`invites`=?,`members`=?,`messages`=?,`roles`=?,`server`=?,`voice`=? WHERE `guildID`=?;';

		const SQLpool = client.conPool.promise();
		const guild = message.guild;


		const [logRows] = await SQLpool.execute(checkLogSettings, [guild.id]); const r = logRows[0];
		const [channels, commands, invites, members, messages, roles, server, voice, channel] = [r.channels, r.commands, r.invites, r.members, r.messages, r.roles, r.server, r.voice, r.logChannel];
		const [option, ...restArgs] = args; let status = 1; const enabled = { 1: 'Enabled', 0: 'Disabled' };


		const updateFunc = async (statement, value, column) => {
			return SQLpool.execute(statement, [value, guild.id])
				.then(() => {
					console.success(`[LOGS CMD] Successfully updated record for ${column} in guild: ${guild.id}`);
					return message.channel.send(`Logging ${enabled[value].toLowerCase()} for: \`${column}\``);
				})
				.catch((error) => {
					console.error(`[LOGS CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		};


		if(!option) {
			const lEmbed = new MessageEmbed()
				.setAuthor(`${guild.name}'s Logging`, guild.iconURL())
				.setThumbnail(guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
				.setDescription(`**Logs Channel:** \`#${channel || 'None'}\``)
				.setFooter(`${guild.me.displayName}`, client.user.avatarURL())
				.setTimestamp()
				.setColor(0xFFFFFA);

			Object.entries(logRows[0]).forEach(([key, value]) => {
				if(key === 'logChannel') return;
				lEmbed.addField(`> ${key}`, `\`${enabled[value]}\``, true);
			});

			return message.channel.send(lEmbed);
		}


		let channelName = restArgs.join('-');
		if(channel) channelName = channel;
		if(!channelName) channelName = 'logs';

		const logsChannel = guild.channels.cache.find(ch => ch.name === channelName);
		if(!logsChannel) {
			await createChannel(client, guild, channelName, 'text', 500, 'logs', guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES'], ['VIEW_CHANNEL', 'SEND_MESSAGES'])
				.catch((error) => {
					console.error(`[GUILD MEMBER ADD] ${error.stack}`);
				});
		}


		if(option === 'channels') {
			updateLogSettings = `UPDATE \`logsettings\` SET \`${option}\`=? WHERE \`guildID\`=?;`;
			if(channels === 1) status = 0;
			await updateFunc(updateLogSettings, status, 'channels');
		}
		if(option === 'commands') {
			updateLogSettings = 'UPDATE `logsettings` SET `commands`=? WHERE `guildID`=?;';
			if(commands === 1) status = 0;
			await updateFunc(updateLogSettings, status, 'commands');
		}
		if(option === 'invites') {
			updateLogSettings = 'UPDATE `logsettings` SET `invites`=? WHERE `guildID`=?;';
			if(invites === 1) status = 0;
			if(status === 1) await addInvites(client, guild.id);
			await updateFunc(updateLogSettings, status, 'invites');
		}
		if(option === 'members') {
			updateLogSettings = 'UPDATE `logsettings` SET `members`=? WHERE `guildID`=?;';
			if(members === 1) status = 0;
			await updateFunc(updateLogSettings, status, 'members');
		}
		if(option === 'messages') {
			updateLogSettings = 'UPDATE `logsettings` SET `messages`=? WHERE `guildID`=?;';
			if(messages === 1) status = 0;
			await updateFunc(updateLogSettings, status, 'messages');
		}
		if(option === 'roles') {
			updateLogSettings = 'UPDATE `logsettings` SET `roles`=? WHERE `guildID`=?;';
			if(roles === 1) status = 0;
			await updateFunc(updateLogSettings, status, 'roles');
		}
		if(option === 'server') {
			updateLogSettings = 'UPDATE `logsettings` SET `server`=? WHERE `guildID`=?;';
			if(server === 1) status = 0;
			await updateFunc(updateLogSettings, status, 'server');
		}
		if(option === 'voice') {
			updateLogSettings = 'UPDATE `logsettings` SET `voice`=? WHERE `guildID`=?;';
			if(voice === 1) status = 0;
			await updateFunc(updateLogSettings, status, 'voice');
		}

	} };
