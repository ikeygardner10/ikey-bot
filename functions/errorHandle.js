module.exports = async (error, message) => {

    console.error(`\n[ERR HANDLE] ${error.stack}\n`);
    console.warn(`\n${JSON.stringify(error)}\n`);

}