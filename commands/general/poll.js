const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const ms = require('ms');
const pollModel = require('../../data/pollModel');
const { pollArray } = require('../../data/arrayData.json');
const titleRegex = RegExp(/{(.*?)}/);
const timeRegex = RegExp(/\((\d+(s|m|h|d|w))\)/);
const optionRegex = RegExp(/\[[^[]+\]/g);

module.exports = {
	config: {
		name: 'poll',
		noalias: 'No Aliases',
		aliases: [],
		usage: '{poll title} (poll time)*(5s/4m/3h/2d/1w)* [poll options]*(up-to 20)*',
		cooldown: 10,
		category: 'general',
		permissions: '',
		args: true,
		description: 'Create a poll for users',
	},
	execute: async (client, message, args) => {

		const pollParameters = args.join(' ');

		const title = titleRegex.test(pollParameters) ? titleRegex.exec(pollParameters)[1] : null;
		if(!title) return message.channel.send('`Invalid (NO POLL TITLE - FORMAT: {POLL TITLE})');

		const pollOptions = pollParameters.match(optionRegex);
		if(!pollOptions) return message.channel.send('`Invalid (NO POLL OPTIONS - FORMAT: [OPTION ONE] [OPTION TWO])`');
		if(pollOptions.length < 2) return message.channel.send('`Invalid (2 OPTIONS MIN.)`');
		if(pollOptions.length > 10) return message.channel.send('`Invalid (MAX. 10 OPTIONS)`');

		const timedPoll = timeRegex.test(pollParameters) ? timeRegex.exec(pollParameters)[1] : null;
		if(typeof ms(timedPoll) !== 'number') return message.channel.send('`Invalid (TIME NOT VALID - FORMAT: (1s/1m/1h/1d/1w)');

		let i = 0;
		const formattedOptions = pollOptions.map(p => `${pollArray[i++]} ${p.replace(/\[|\]/g, '')}`).join('\n\n');

		const embed = new MessageEmbed()
			.setAuthor(`${title} Poll`, client.user.avatarURL())
			.setDescription(formattedOptions)
			.setFooter(timedPoll ? `Ends at: ${moment(Date.now() + ms(timedPoll)).format('LLLL')}` : '')
			.setTimestamp()
			.setColor(0xFFFFFA);

		const msg = await message.channel.send(embed);

		if(timedPoll) {
			const pollDoc = new pollModel({
				guild: message.guild.id,
				textChannel: message.channel.id,
				message: msg.id,
				expiryDate: Date.now() + ms(timedPoll),
			});

			await pollDoc.save().catch(err => console.log(err));
		}

		for (i = 0; i < pollOptions.length; i++) {
			await msg.react(pollArray[i]).catch(err => console.log(err));
		}
	},
};