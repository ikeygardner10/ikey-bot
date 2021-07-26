const { addition, subtraction, multiplication, division } = require('../../data/arrayData.json');

module.exports = {
	config: {
		name: 'calculate',
		aliases: ['c'],
		usage: '<number operand number>',
		cooldown: 3,
		category: 'general',
		permissions: '',
		args: true,
		description: 'Calculate basic values',
	},
	execute: async (client, message, args) => {

		const [first, operand, second] = [args[0], args[1], args[2]];
		const [one, two] = [Number(first), Number(second)];
		let errors = '';

		switch(one) {
		case isNaN:
			errors += `\`${first} is not a number\n\``;
			break;
		default:
		}
		switch(two) {
		case isNaN:
			errors += `\`${second} is not a number\``;
			break;
		default:
		}

		if(errors.length < 0) return message.channel.send(errors);

		if(addition.includes(operand)) return message.channel.send(one + two);
		if(subtraction.includes(operand)) return message.channel.send(one - two);
		if(multiplication.includes(operand)) return message.channel.send(one * two);
		if(division.includes(operand)) return message.channel.send(one / two);
		else return message.channel.send(`\`${operand} is not a valid operator\``);

	} };