const { MessageEmbed } = require('discord.js');
const { tableToEmoji, numberToEmoji } = require('../../data/arrayData.json');

module.exports = {
	config: {
		name: 'stats',
		aliases: ['top'],
		usage: '<@user> / <command name + (page number optional)>\n<command name + @user + (page number optional)> / <@user + command name + (page number optional)>',
		cooldown: 10,
		category: 'info',
		permissions: '',
		args: false,
		description: 'Show the top commands used on or by a user, or globally\nCommands:\n`action`\n`dance`\n`fuck`\n`handhold`\n`highfive`\n`hug`\n`kiss`\n`pat`\n`punch`\n`shoot`\n`slap`\n`spank`\n`stab`',
	},
	execute: async (client, message, args) => {

		const member = message.mentions.members.first();
		const SQLpool = client.conPool.promise();
		const tables = client.commands.filter(cmd => (cmd.config.category === 'action' && cmd.config.name !== 'kill' && cmd.config.name !== 'dodge') || (cmd.config.category === 'nsfw' && cmd.config.name === 'fuck')).map(c => `${c.config.name}`);
		let stmt; let [rows] = [];

		const embed = new MessageEmbed()
			.setAuthor(`${client.user.username} Stats`, client.user.avatarURL())
			.setColor(0xFFFFFA);

		const sort = ((object, start = 0, end = 0) => {
			return Object.fromEntries(Object.entries(object).sort(([, a], [, b]) => b - a).slice(start, end));
		});

		if(!args[0] || isNaN(args[0]) === false) {

			let pageValue = 1;
			if(args[0]) {
				if(args[0] > 0 && args[0] < 11) pageValue = Number(args[0]);
				else return message.lineReply('`Invalid (NOT A VALID NUMBER, 1 - 10)`');
			}

			const sliceTwo = 10 * pageValue;
			let sliceFour = 3 * pageValue;
			if(pageValue > 4) sliceFour = tables.length;
			const [sliceOne, sliceThree] = [sliceTwo - 10, sliceFour - 3];

			const userTotal = {};
			const commandTotal = {};

			for (let t = 0; t < tables.length; t++) {
				const table = `${tables[t]}Count`;
				stmt = `SELECT \`userID\`, \`messageCount\` FROM \`${table}\``;
				[rows] = await SQLpool.execute(stmt);
				for (let r = 0; r < rows.length; r++) {
					const row = rows[r];
					const userID = `${row.userID}`;
					if(!commandTotal[table]) {
						commandTotal[table] = row.messageCount;
					}
					else {
						commandTotal[table] = commandTotal[table] + row.messageCount;
					}
					if(!userTotal[userID]) {
						userTotal[userID] = row.messageCount;
					}
					else {
						userTotal[userID] = userTotal[userID] + row.messageCount;
					}
				}
			}

			const sortedUserTotal = sort(userTotal, sliceOne, sliceTwo);
			const sortedCommandTotal = sort(commandTotal, sliceThree, sliceFour);

			const [commands] = [Object.keys(sortedCommandTotal)];
			const [commandTotals] = [Object.values(sortedCommandTotal)];
			let descOne = '';
			for (let c = 0; c < commands.length; c++) {
				let command = commands[c];
				const total = commandTotals[c];
				command = command.slice(0, 1).toUpperCase() + command.slice(1, command.length - 5);
				descOne += `${tableToEmoji[commands[c]]} **${command}**\n:white_small_square: ${total} times\n`;
			}

			const [users] = [Object.keys(sortedUserTotal)];
			const [userTotals] = [Object.values(sortedUserTotal)];
			let descTwo = '';
			for (let u = 0; u < users.length; u++) {
				let user = users[u];
				const total = userTotals[u];
				try {
					user = await client.users.cache.get(user).username;
				}
				catch {
					user = `Unknown User (${user})`;
				}
				descTwo += `${numberToEmoji[u + 1]} **${user}**\n:white_small_square: ${total} times\n`;
			}

			embed.setAuthor(`${client.user.username} Global Stats`, client.user.avatarURL());
			embed.setThumbnail(client.user.avatarURL({ format: 'png', dynamic: true, size: 512 }));
			embed.setDescription(`**Top Commands:**\n${descOne}\n**Top Users:**\n${descTwo}`);
			return message.channel.send(embed);
		}

		if(tables.includes(args[0]) && !member) {

			let pageValue = 1;
			if(args[1] && isNaN(args[1]) === false) {
				if(args[1] > 0 && args[1] < 11) pageValue = Number(args[1]);
				else return message.lineReply('`Invalid (NOT A VALID NUMBER, 1 - 10)`');
			}

			const sliceTwo = 10 * pageValue;
			const sliceOne = sliceTwo - 10;

			const userTotal = {};

			const command = args[0];
			const table = `${command}Count`;
			stmt = `SELECT \`userID\`, \`messageCount\` FROM \`${table}\``;
			[rows] = await SQLpool.execute(stmt);
			for (let r = 0; r < rows.length; r++) {
				const row = rows[r];
				const userID = `${row.userID}`;
				if(!userTotal[userID]) {
					userTotal[userID] = row.messageCount;
				}
				else {
					userTotal[userID] = userTotal[userID] + row.messageCount;
				}
			}

			const sortedUserTotal = sort(userTotal, sliceOne, sliceTwo);

			const [users] = [Object.keys(sortedUserTotal)];
			const [userTotals] = [Object.values(sortedUserTotal)];
			let desc = '';
			for (let u = 0; u < users.length; u++) {
				let user = users[u];
				const total = userTotals[u];
				try {
					user = await client.users.cache.get(user).username;
				}
				catch {
					user = `Unknown User (${user})`;
				}
				desc += `${numberToEmoji[u + 1]} **${user}**\n:white_small_square: ${total} times\n`;
			}

			embed.setAuthor(`${client.user.username} Command Stats`, client.user.avatarURL());
			embed.setThumbnail(client.user.avatarURL({ format: 'png', dynamic: true, size: 512 }));
			embed.setDescription(`:floppy_disk: **Command:** \`${table.slice(0, table.length - 5)}\`\n\n**Top Users:**\n${desc}`);
			return message.channel.send(embed);
		}

		if(member && !args[1]) {

			let userTotal = 0;
			const commandTotal = {};

			for (let t = 0; t < tables.length; t++) {
				const table = `${tables[t]}Count`;
				stmt = `SELECT \`userID\`, \`messageCount\` FROM \`${table}\` WHERE \`userID\`=?;`;
				[rows] = await SQLpool.execute(stmt, [member.id]);
				for (let r = 0; r < rows.length; r++) {
					const row = rows[r];
					userTotal = userTotal + row.messageCount;
					if(!commandTotal[table]) {
						commandTotal[table] = row.messageCount;
					}
					else {
						commandTotal[table] = commandTotal[table] + row.messageCount;
					}
				}
			}

			const sortedCommandTotal = sort(commandTotal, 0, tables.length);

			const [commands] = [Object.keys(sortedCommandTotal)];
			const [commandTotals] = [Object.values(sortedCommandTotal)];
			let desc = '';
			for (let c = 0; c < commands.length; c++) {
				let command = commands[c];
				const total = commandTotals[c];
				command = command.slice(0, 1).toUpperCase() + command.slice(1, command.length - 5);
				desc += `${tableToEmoji[commands[c]]} **${command}**\n:white_small_square: ${total} times\n`;
			}

			embed.setAuthor(`${client.user.username} User Stats`, client.user.avatarURL());
			embed.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }));
			embed.setDescription(`**:bust_in_silhouette: User:** ${member.user.tag}\n\n${desc}`);
			embed.setFooter(`ID: ${member.user.id} | Total Commands Used: ${userTotal}`);
			return message.channel.send(embed);
		}

		if(tables.includes(args[1]) && member) {

			let pageValue = 1;
			if(args[2] && isNaN(args[2]) === false) {
				if(args[2] > 0 && args[2] < 11) pageValue = Number(args[2]);
				else return message.lineReply('`Invalid (NOT A VALID NUMBER, 1 - 10)`');
			}

			const sliceTwo = 10 * pageValue;
			const sliceOne = sliceTwo - 10;

			let commandTotal = 0;
			const userTotal = {};

			const table = `${args[1]}Count`;
			stmt = `SELECT \`memberID\`, \`messageCount\` FROM \`${table}\` WHERE \`userID\`=?;`;
			[rows] = await SQLpool.execute(stmt, [member.id]);
			for (let r = 0; r < rows.length; r++) {
				const row = rows[r];
				const userID = row.memberID;
				commandTotal = commandTotal + row.messageCount;
				if(!userTotal[userID]) {
					userTotal[userID] = row.messageCount;
				}
				else {
					userTotal[userID] = userTotal[userID] + row.messageCount;
				}
			}

			const sortedUserTotal = sort(userTotal, sliceOne, sliceTwo);

			const [users] = [Object.keys(sortedUserTotal)];
			const [userTotals] = [Object.values(sortedUserTotal)];
			let desc = '';
			for (let m = 0; m < users.length; m++) {
				let user = users[m];
				const total = userTotals[m];
				try {
					user = await client.users.cache.get(user).username;
				}
				catch {
					user = `Unknown User (${user})`;
				}
				desc += `${numberToEmoji[m + 1]} **${user}**\n:white_small_square: ${total} times\n`;
			}
			embed.setAuthor(`${client.user.username} User Command Stats`, client.user.avatarURL());
			embed.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }));
			embed.setDescription(`**:bust_in_silhouette: User:** ${member.user.tag}\n:floppy_disk: **Command:** \`${table.slice(0, table.length - 5)}\`\n\n**Used On:**\n${desc}`);
			embed.setFooter(`ID: ${member.user.id} | Total Commands Used: ${commandTotal}`);
			return message.channel.send(embed);
		}

		if(tables.includes(args[0]) && member) {

			let pageValue = 1;
			if(args[2] && isNaN(args[2]) === false) {
				if(args[2] > 0 && args[2] < 11) pageValue = Number(args[2]);
				else return message.lineReply('`Invalid (NOT A VALID NUMBER, 1 - 10)`');
			}

			const sliceTwo = 10 * pageValue;
			const sliceOne = sliceTwo - 10;

			let commandTotal = 0;
			const userTotal = {};

			const table = `${args[0]}Count`;
			stmt = `SELECT \`userID\`, \`messageCount\` FROM \`${table}\` WHERE \`memberID\`=?;`;
			[rows] = await SQLpool.execute(stmt, [member.id]);
			for (let r = 0; r < rows.length; r++) {
				const row = rows[r];
				const userID = row.userID;
				commandTotal = commandTotal + row.messageCount;
				if(!userTotal[userID]) {
					userTotal[userID] = row.messageCount;
				}
				else {
					userTotal[userID] = userTotal[userID] + row.messageCount;
				}
			}

			const sortedUserTotal = sort(userTotal, sliceOne, sliceTwo);

			const [users] = [Object.keys(sortedUserTotal)];
			const [userTotals] = [Object.values(sortedUserTotal)];
			let desc = '';
			for (let m = 0; m < users.length; m++) {
				let user = users[m];
				const total = userTotals[m];
				try {
					user = await client.users.cache.get(user).username;
				}
				catch {
					user = `Unknown User (${user})`;
				}
				desc += `${numberToEmoji[m + 1]} **${user}**\n:white_small_square: ${total} times\n`;
			}
			embed.setAuthor(`${client.user.username} User Command Stats`, client.user.avatarURL());
			embed.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }));
			embed.setDescription(`**:bust_in_silhouette: User:** ${member.user.tag}\n:floppy_disk: **Command:** \`${table.slice(0, table.length - 5)}\`\n\n**Used By:**\n${desc}`);
			embed.setFooter(`ID: ${member.user.id} | Total Commands Used: ${commandTotal}`);
			return message.channel.send(embed);
		}

		return message.lineReply('`Usage:`\n`$top`\n`$top <@user>`\n`$top <command name + (page number optional)>`\n`$top <command name + @user + (page number optional)>`\n`$top <@user + command name + (page number optional)>`');

	} };