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

		const amount = args[0];	if(isNaN(amount)) return;
		if(amount < 1) return message.channel.send('`Invalid (MIN. 1 MESSAGE)`');
		if(amount > 1000) return message.channel.send('`Invalid (MAX. 1000 MESSAGES)`');
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
			await message.channel.bulkDelete(amount)
				.then(() => {
					return message.channel.send(`\`Success\`\n\`${amount} deleted\``);
				})
				.catch((error) => {
					console.error(`[PURGE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
	} };