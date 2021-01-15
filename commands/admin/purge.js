module.exports = {
	config: {
		name: 'purge',
		aliases: ['p', 'delete'],
		usage: '<amount 1-1000>',
		cooldown: 2,
		category: 'admin',
		permissions: 'Manage Messages',
		args: true,
		description: 'Bulk deletes upto 1000 messages',
	},
	execute: async (client, message, args) => {

		// Define args as amount, return if amount is invalid
		const amount = args[0];
		if(isNaN(amount)) return ('`Invalid (NOT A NUMBER)`');
		if(amount < 1) return message.channel.send('`Invalid (MIN. 1 MESSAGE)`');
		if(amount > 1000) return message.channel.send('`Invalid (MAX. 1000 MESSAGES)`');

		// If amount is higher than 100, bulk delete in batches of 50 (for loop)
		// If amount is lower than 100, bulk delete amount
		// Finally, return success message, or return if error
		if(amount > 100) {
			await message.channel.send('`This while take a while`');
			for(let i = 0; i < amount; i = i + 50) {
				try {
					await message.channel.bulkDelete(50);
				} catch(error) {
					console.error(`[PURGE CMD] ${error.stack}`);
					i = amount;
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				}
			}
			return message.channel.send(`\`Success\`\n\`${amount} deleted\``);
		} else {
			await message.delete();
			await message.channel.bulkDelete(amount)
				.catch((error) => {
					console.error(`[PURGE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
	} };