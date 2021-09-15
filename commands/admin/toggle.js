/* eslint-disable no-inner-declarations */
const { MessageEmbed } = require('discord.js');
const createChannel = require('../../functions/createChannel');
const { booleanToEnable, booleanToDelete } = require('../../data/arrayData.json');

module.exports = {
	config: {
		name: 'toggle',
		aliases: ['tc', 'disable'],
		usage: '<command>/all/list',
		cooldown: 5,
		category: 'admin',
		permissions: 'Manage Server',
		args: true,
		description: '**-** Disable/enable commands per channel\n**-** Disable ALL commands per channel\n**-** List currently disabled commands',
	},
	execute: async (client, message, args) => {

		const SQLpool = client.conPool.promise();

		if(!args[0]) return message.lineReply('`Invalid (CHOOSE A COMMAND/ALL/LIST)`');

		const embed = new MessageEmbed();
		const user = message.member.user;
		const command = args[0].toLowerCase();

		let stmt = 'SELECT `commands`, `serverLogs` FROM `logsettings` WHERE `guildID`=?;';
		let [rows] = await SQLpool.query(stmt, [message.guild.id]);

		const [enabled, channel] = [rows[0].commands, rows[0].serverLogs];

		if(enabled === 1) {
			embed.setFooter(`ID: ${user.id}`);
			embed.setTimestamp();
			embed.setColor(0xFFFFFA);
		}

		if(args[0].toLowerCase() === 'list') {

			stmt = 'SELECT * FROM `disabledcommands` WHERE `guildID`=?;';
			[rows] = await SQLpool.execute(stmt, [message.guild.id]);
			if(rows[0] === undefined) return message.lineReply('`Invalid (NOTHING DISABLED)`');

			const tEmbed = new MessageEmbed()
				.setAuthor(`${message.guild.name}'s Disabled List`, message.guild.iconURL())
				.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
				.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
				.setTimestamp()
				.setColor(0xFFFFFA);


			await message.guild.channels.cache.forEach(chan => {
				if(chan.type !== 'text') return;
				const mappedRows = rows.map(row => {
					if(row.channelID !== chan.id) return;
					if(!row.command) return;
					const cmd = `\`${row.command}\``;
					return cmd;
				});
				const filtered = mappedRows.filter(function(cmd) {
					return cmd != null;
				});
				if(filtered.length === 0) return;
				tEmbed.addField(`> ${chan.name}`, filtered.join(' '));
			});
			return message.lineReply(tEmbed);
		}

		const updateFunc = async (statement, value, cmd) => {
			return SQLpool.execute(statement, [cmd, message.guild.id, message.channel.id])
				.then(() => {
					console.success(`[TOGGLE CMD] Successfully ${booleanToDelete[value].toLowerCase()} record for ${cmd} in guild: ${message.guild.id} for channel: ${message.channel.id}`);
					return message.lineReply(`\`${cmd}\` ${booleanToEnable[value].toLowerCase()} for channel: \`#${message.channel.name}\``);
				})
				.catch((error) => {
					console.error(`[TOGGLE CMD] ${error.stack}`);
					return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		};

		if(client.commands.has(command) || client.aliases.has(command) || command === 'all') {

			let commandName;
			let category;
			if(command !== 'all') {
				commandName = await client.commands.get(command) ? await client.commands.get(command).config.name : await client.commands.get(await client.aliases.get(command)).config.name;
				category = await client.commands.get(command) ? await client.commands.get(command).config.category : await client.commands.get(await client.aliases.get(command)).config.category;
			}
			else {
				commandName = 'all';
			}
			if(category === 'owner') return;

			stmt = 'SELECT * FROM `disabledcommands` WHERE `command`=? AND `guildID`=? AND `channelID`=?;';
			[rows] = await SQLpool.execute(stmt, [commandName, message.guild.id, message.channel.id]);

			if(!rows[0]) {

				if(enabled === 1) {
					embed.setAuthor('Command Disabled', user.avatarURL);
					embed.setDescription(`**User:** ${user}\n**Command:** \`${commandName}\`\n**Channel:** \`#${message.channel.name}\``);
					let logChannel = await message.guild.channels.cache.find(ch => ch.name === channel);
					if(!logChannel) {
						await createChannel(client, message.guild, 'server-logs', 'text', 500, 'server-logs', message.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
							.then(() => {
								logChannel = message.guild.channels.cache.find(ch => ch.name === 'server-logs');
								logChannel.send(embed);
							})
							.catch((error) => {
								console.error(`[VOICE STATE UPDATE] ${error.stack}`);
							});
					}
					else {
						await logChannel.send(embed);
					}
				}
				stmt = 'INSERT INTO `disabledcommands` (`command`, `guildID`, `channelID`) VALUES (?, ?, ?);';
				return updateFunc(stmt, 0, commandName);

			}
			else {

				if(enabled === 1) {
					embed.setAuthor('Command Enabled', user.avatarURL);
					embed.setDescription(`**User:** ${user}\n**Command:** \`${commandName}\`\n**Channel:** \`#${message.channel.name}\``);
					let logChannel = await message.guild.channels.cache.find(ch => ch.name === channel);
					if(!logChannel) {
						await createChannel(client, message.guild, 'server-logs', 'text', 500, 'server-logs', message.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
							.then(() => {
								logChannel = message.guild.channels.cache.find(ch => ch.name === 'server-logs');
								logChannel.send(embed);
							})
							.catch((error) => {
								console.error(`[VOICE STATE UPDATE] ${error.stack}`);
							});
					}
					else {
						await logChannel.send(embed);
					}
				}
				stmt = 'DELETE FROM `disabledcommands` WHERE `command`=? AND `guildID`=? AND `channelID`=?;';
				return updateFunc(stmt, 1, commandName);

			}
		}

		return message.lineReply('`Invalid (USE $help toggle FOR AVAILABLE OPTIONS)`');

	} };