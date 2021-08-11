/* eslint-disable no-useless-catch */
const axios = require('axios');
const cio = require('cheerio-without-node-native');

const searchUrl = 'https://api.genius.com/search?q=';

const checkOptions = async (options) => {
	const { apiKey, title, artist } = options;
	switch ('undefined') {
	case typeof apiKey:
		throw '"apiKey" property is missing from options';
	case typeof title:
		throw '"title" property is missing from options';
	case typeof artist:
		throw '"artist" property is missing from options';
	default:
		break;
	}
};

const getTitle = async (title, artist) => {
	return `${title} ${artist}`
		.toLowerCase()
		.replace(/ *\([^)]*\) */g, '')
		.replace(/ *\[[^\]]*]/, '')
		.replace(/feat.|ft./g, '')
		.replace(/\s+/g, ' ')
		.trim();
};

const searchSong = async (options) => {
/**
 * @param {{apiKey: string, title: string, artist: string, optimizeQuery: boolean}} options
 */
	try {
		await checkOptions(options);
		const { apiKey, title, artist, optimizeQuery = false } = options;
		const song = await optimizeQuery ? await getTitle(title, artist) : `${title} ${artist}`;
		const reqUrl = `${searchUrl}${encodeURIComponent(song)}`;
		const headers = {
			Authorization: `Bearer ${apiKey}`,
		};
		const { data } = await axios.get(reqUrl, { headers });
		if (data.response.hits.length === 0) return null;
		const results = await data.response.hits.map((val) => {
			const { full_title, song_art_image_url, id, url } = val.result;
			return { id, title: full_title, albumArt: song_art_image_url, url };
		});
		return results;
	}
	catch (e) {
		throw e;
	}
};

const getSong = async (options) => {
/**
 * @param {{apiKey: string, title: string, artist: string, optimizeQuery: boolean}} options
 */
	try {
		await checkOptions(options);
		const results = await searchSong(options);
		if (!results) return null;
		const lyrics = await extractLyrics(results[0].url);
		return {
			id: results[0].id,
			title: results[0].title,
			url: results[0].url,
			lyrics,
			albumArt: results[0].albumArt,
		};
	}
	catch (e) {
		throw e;
	}
};

const extractLyrics = async (url) => {
/**
 * @param {string} url - Genius URL
 */
	try {
		const { data } = await axios.get(url);
		const $ = cio.load(data);
		let lyrics = $('div[class="lyrics"]').text().trim();
		if (!lyrics) {
			lyrics = '';
			$('div[class^="Lyrics__Container"]').each((i, elem) => {
				if($(elem).text().length !== 0) {
					const snippet = $(elem).html()
						.replace(/<br>/g, '\n')
						.replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
					lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
				}
			});
		}
		if (!lyrics) return null;
		return lyrics.trim();
	}
	catch (e) {
		throw e;
	}
};

const getAlbumArt = async (options) => {
	checkOptions(options);
	const results = await searchSong(options);
	if (!results) return null;
	return results[0].albumArt;
};

module.exports = { getSong, getAlbumArt };