module.exports = {
	config: {
		name: 'prefix',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<new prefix>',
		cooldown: 10,
		category: 'admin',
		permissions: 'Manage Server',
		args: false,
		description: 'Change or check server prefix\n(+prefixreset resets to default)',
	},
	execute: async (client, message, args) => {


		const updatePrefix = 'UPDATE `guildsettings` SET `prefix`= ? WHERE `guildID`= ?';
		const checkPrefix = 'SELECT `prefix` FROM `guildsettings` WHERE `guildID`= ?';
		const SQLpool = client.conPool.promise();

		if(!args[0]) {
			return SQLpool.execute(checkPrefix, [message.guild.id])
				.then(([rows]) => {
					return message.channel.send(`\`Your server prefix is ${rows[0].prefix}\``);
				}).catch((error) => {
					console.error(`[PREFIX CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}

		const prefixArray = ['+', '-', '&', '^', '%', '$', '!', '=', '_', '/', '?', '>', '.', ',', ';' ];
		const prefix = args[0].charAt(0);

		if(prefixArray.includes(prefix)) {
			return SQLpool.execute(updatePrefix, [prefix, message.guild.id])
				.then(() => {
					console.success(`[PREFIX CMD] Successfully updated record for guildsettings: ${message.guild.id}`);
					return message.channel.send(`Server prefix set to \`${prefix}\``);
				}).catch((error) => {
					console.error(`[PREFIX CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else if(!prefixArray.includes(prefix)) {
			return message.channel.send(`\`Invalid Prefix (AVAILABLE PREFIXES: ${prefixArray.join(' ')} )\``);
		}
	} };