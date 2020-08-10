module.exports = {
	config: {
		name: 'purge',
		aliases: ['p', 'delete'],
		usage: '<amount 1-100>',
		cooldown: 2,
		category: 'admin',
		permissions: 'Manage Messages',
		args: true,
		description: 'Bulk deletes x amount of messages',
	},
	execute: async (client, message, args) => {

		const amount = args[0];	if(!amount) return;
		if(isNaN(amount)) return message.channel.send('Not a valid number.');
		if(amount > 100) return message.channel.send('Maximum 100 messages.');
		if(amount < 1) return message.channel.send('Minimum 1 message.');

		try {
			await message.delete();
			return message.channel.bulkDelete(amount);
		} catch(error) {
			console.error(`[PURGE CMD] ${error.stack}`);
			return message.channel.send();
		}
	},
};