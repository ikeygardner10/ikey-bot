const { prefix } = require('../../data/arrayData.json');

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

		// Define SQLpool
		const SQLpool = client.conPool.promise();

		// Outline SQL statement
		const updatePrefix = 'UPDATE `guildsettings` SET `prefix`= ? WHERE `guildID`= ?';
		const checkPrefix = 'SELECT `prefix` FROM `guildsettings` WHERE `guildID`= ?';

		// If no args, check current guild prefix, return message, or error
		if(!args[0]) {
			return SQLpool.execute(checkPrefix, [message.guild.id])
				.then(([rows]) => {
					return message.channel.send(`\`Your server prefix is ${rows[0].prefix}\``);
				}).catch((error) => {
					console.error(`[PREFIX CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}

		// Define first character as new prefix
		const newPrefix = args[0].charAt(0);

		// Check available prefix array for new prefix
		// Update database and return success, or return if error
		// If prefix isn't available, return list of available prefix
		if(prefix.includes(newPrefix)) {
			return SQLpool.execute(updatePrefix, [newPrefix, message.guild.id])
				.then(() => {
					console.success(`[PREFIX CMD] Successfully updated record for guildsettings: ${message.guild.id}`);
					return message.channel.send(`Server prefix set to \`${newPrefix}\``);
				}).catch((error) => {
					console.error(`[PREFIX CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else if(!prefix.includes(newPrefix)) {
			return message.channel.send(`\`Invalid Prefix (AVAILABLE PREFIXES: ${prefix.join(' ')} )\``);
		}
	} };