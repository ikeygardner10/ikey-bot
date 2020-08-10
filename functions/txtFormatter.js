const { encode, decode } = require('utf8');

module.exports = function(s) {
	try {
		s = encode(s);
		s = decode(s);
		s = s.replace(/@everyone/g, '@\u200beveryone');
		s = s.replace(/@here/g, '@\u200bhere');
		s = s.replace(/<@&(.*?)>/g, '@\u200brole');
		s = s.replace(/'/g, '\'');
		s = s.replace(/"/g, '\'\'');
		s = s.replace(/\\u[\dA-F]{4}/gi,
			function(match) {
				return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 8));
			});
		return s;
	} catch(error) {
		console.error(`[TXT FORMAT] ${error.stack}`);
	}
};