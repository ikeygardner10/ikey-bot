const txtFormatter = require('../../functions/txtFormatter.js');

module.exports = {
	config: {
		name: 'string',
		aliases: ['str'],
		usage: '<string>',
		cooldown: 5,
		category: 'general',
		permissions: '',
		args: true,
		description: 'Formats a string using same function as tag system\nCan be used to test string output before creating tags\nReturns formatted string',
	},
	execute: async (client, message, args) => {

		try {
			const string = args.join(' '); if(!string) return message.channel.send('`Invalid (NO STRING)`');
			const newStr = txtFormatter(string);
			console.info(`[STRING CMD] ${newStr}`);
			return message.channel.send((newStr));
		} catch(error) {
			console.error(`[STRING CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };