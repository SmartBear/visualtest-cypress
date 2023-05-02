const fs = require('fs');
const chalk = require("chalk");

// Define the path of the folder to delete
const folderPath = './mochawesome-report';

const deleteFolder = () => {
    try {
        process.stdout.write(chalk.dim(`Cleaning up if there was a past mochawesome report... \t`));
        fs.rmSync(folderPath, {recursive: true})
        console.log(chalk.green.dim(`folder ${folderPath} successfully deleted`));
    } catch (err) {
        console.error(chalk.yellow.dim(`failure here is OK: `, err));
    }
}
module.exports = deleteFolder;
