module.exports = {
	config: {
		name: 'spam',
		aliases: ['z'],
		usage: '<amount> <seconds delay> <message>',
		cooldown: 1,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Spam',
	},
	execute: async (client, message, args) => {

		const [amount, delay, ...restArgs] = args;
		if(!amount) return message.channel.send('`Invalid (NO AMOUNT)`');
		if(!delay) return message.channel.send('`Invalid (NO DELAY)`');
		const msg = restArgs.join(' '); if(!msg) return message.channel.send('`Invalid (NO MESSAGE)`');
		const sleep = ms => new Promise(res => setTimeout(res, ms));
		for(let i = 0; i < amount; i++) {
			await sleep(delay * 1000);
			await message.channel.send(msg);
		}
	} };
