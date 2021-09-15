const { MessageEmbed } = require('discord.js');
const addInvites = require('../../functions/addInvites');
const createChannel = require('../../functions/createChannel');
const { booleanToEnable, loggingOptions } = require('../../data/arrayData.json');

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
		description: 'Disable/enable logs\n**Options:**\nchannels\ncommands\ninvites\nmembers\nmessages\nroles\nserver\nvoicechannels\n\nCan select a channel name, or leave blank for defaults',
	},
	execute: async (client, message, args) => {

		const SQLpool = client.conPool.promise();

		if(!args[0]) {

			const stmt = 'SELECT `channels`, `commands`, `invites`, `members`, `messages`, `roles`, `server`, `voicechannels`, `activityLogs`, `serverLogs`, `userLogs` FROM `logsettings` WHERE `guildID`=?;';
			const [rows] = await SQLpool.execute(stmt, [message.guild.id]);

			const embed = new MessageEmbed()
				.setAuthor(`${message.guild.name}'s Logging`, message.guild.iconURL())
				.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
				.setDescription(`**Activity Logs:** \`#${rows[0].activityLogs || 'None'}\`\n**Server Logs:** \`#${rows[0].serverLogs || 'None'}\`\n**User Logs:** \`#${rows[0].userLogs || 'None'}\``)
				.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
				.setTimestamp()
				.setColor(0xFFFFFA);

			Object.entries(rows[0]).forEach(([key, value]) => {
				switch(key) {
				case 'activityLogs': case 'serverLogs': case 'userLogs':
					return;
				}
				embed.addField(`> ${key}`, `\`${booleanToEnable[value]}\``, true);
			});

			return message.lineReply(embed);
		}

		const updateFunc = async (statement, value, column) => {
			return SQLpool.execute(statement, [message.guild.id])
				.then(() => {
					console.success(`[LOGS CMD] Successfully updated record for ${column} in guild: ${message.guild.id}`);
					return message.lineReply(`Logging ${booleanToEnable[value].toLowerCase()} for: \`${column}\``);
				})
				.catch((error) => {
					console.error(`[LOGS CMD] ${error.stack}`);
					return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		};

		if(loggingOptions.includes(args[0])) {

			const [option, ...restArgs] = args;
			let channelName = restArgs.join('-');
			let column; let channel;

			switch(option) {
			case 'channels': case 'commands': case 'invites': case 'roles': case 'server':
				column = 'serverLogs';
				channel = 'server-logs';
				break;
			case 'members':
				column = 'userLogs';
				channel = 'user-logs';
				break;
			case 'messages': case 'voicechannels':
				column = 'activityLogs';
				channel = 'activity-logs';
				break;
			}

			let stmt = `SELECT \`${option}\`, \`${column}\` FROM \`logsettings\` WHERE \`guildID\`=?;`;
			const [rows] = await SQLpool.execute(stmt, [message.guild.id]);

			if(rows[0].logChannel) channelName = rows[0].logChannel;
			if(!channelName) channelName = channel;

			const logChannel = message.guild.channels.cache.find(ch => ch.name === channelName);
			if(!logChannel) {
				await createChannel(client, message.guild, channelName, 'text', 500, 'logs', message.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES', 'MANAGE_MESSAGES'], ['VIEW_CHANNEL', 'SEND_MESSAGES'])
					.catch((error) => {
						console.error(`[GUILD MEMBER ADD] ${error.stack}`);
					});
			}

			let value = 1;
			if(rows[0][option] === 1) value = 0;

			stmt = `UPDATE \`logsettings\` SET \`${option}\` = ${value}, \`${column}\` = '${channelName}' WHERE \`guildID\`=?;`;
			if(option === 'invites' && value === 1) await addInvites(client, message.guild.id);
			return updateFunc(stmt, value, `${option}`);

		}

		return message.lineReply('`Invalid (USE $help logs FOR AVAILABLE OPTIONS)`');

	} };