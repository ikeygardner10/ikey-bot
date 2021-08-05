const { encode, decode } = require('utf8');

module.exports = function(str) {
	try {
		str = encode(str);
		str = decode(str);
		str = str.replace(/@everyone/g, '@\u200beveryone');
		str = str.replace(/@here/g, '@\u200bhere');
		str = str.replace(/<@&(.*?)>/g, '@\u200brole');
		str = str.replace(/'/g, '\'');
		str = str.replace(/"/g, '\'\'');
		str = str.replace(/\\u[\dA-F]{4}/gi,
			function(match) {
				return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 8));
			});
		return str;
	}
	catch(error) {
		console.error(`[TXT FORMAT] ${error.stack}`);
	}
};