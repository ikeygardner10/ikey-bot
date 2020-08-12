const fs = require('fs-extra');
const request = require('request');

module.exports = async function(URI, fileName, filePath) {
	try {
		console.info(`[IMG DWNLD] Starting image download: ${filePath}${fileName}`);
		request(URI)
			.on('error', console.error)
			.pipe(fs.createWriteStream(`${filePath}${fileName}`));
		console.success(`[IMG DWNLD] Successfully downloaded image: ${filePath}${fileName}`);
	} catch(error) {
		console.error(`[IMG DWNLD] ${error.stack}`);
	}
};