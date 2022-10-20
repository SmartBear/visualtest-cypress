#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk')
const cwd = process.cwd();

const pluginRequire = `\nrequire('@smartbear/sbvt-cypress')(module)`;
const commandsImport = `\nimport '@smartbear/sbvt-cypress/commands'`;
const vtConfContent = `module.exports = {\n\tprojectToken: 'PROJECT_TOKEN',\n\ttestRunName: 'My first test',\n}`;
const jsonData = `"chromeWebSecurity": false`
//TODO add try catch
const usersCypress = JSON.parse(fs.readFileSync(path.resolve(path.dirname(require.resolve('cypress', {paths: [cwd]})), 'package.json')),);
let checkForOlderVersion = () => {
    if (usersCypress.version.split('.')[0] < 7 || (usersCypress.version.split('.')[0] <= 7 && usersCypress.version.split('.')[1] < 4)) {
        const filePath = path.resolve(process.cwd(), 'cypress.json');
        if (fs.existsSync(filePath)) { //file exists
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            if (fileContent.toString().includes(jsonData)){
                console.log(chalk.blue(`Detected Cypress ${usersCypress.version}`))
                console.log(chalk.blue(`chromeWebSecurity found in cypress.json`));
            } else {
                console.log(chalk.yellow(`Detected Cypress ${usersCypress.version}`))
                console.log(chalk.yellow(`This is below 7.4.0 - extra parameters are required.\n`))
                // console.log()
                console.log(chalk.bgRedBright('include the below line in your cypress.json file'))
                console.log(chalk.magenta(jsonData))
                console.log(chalk.dim(`Read about it here: https://docs.cypress.io/guides/guides/web-security\n`))
            }
        } else {
            console.log(chalk.yellow(`Detected Cypress ${usersCypress.version}`))
            console.log(chalk.yellow(`This is below 7.4.0 - extra parameters are required.\n`))
            console.log(chalk.bgRedBright('cypress.json not found. This is required for Cypress < 10'))
            process.stdout.write('Please run: ');
            console.log(chalk.magenta.underline('npx cypress open\n'));
            console.log(chalk.bgRedBright('\n Then, include the below line in your cypress.json file'))
            console.log(chalk.magenta(jsonData))
            console.log(chalk.dim(`Read about it here: https://docs.cypress.io/guides/guides/web-security\n`))
        }
    }
}
let setupVTConf = () => {
    const filePath = `${process.cwd()}/visualTest.config.js`;

    if (fs.existsSync(filePath)){ //file exists
        console.log(chalk.blue(`visualTest.config.js found.`));
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        if (fileContent.toString().includes('projectToken') && fileContent.toString().includes('module.exports')){ //vtConf boilerplate looks good

            if (fileContent.toString().includes(`projectToken: 'PROJECT_TOKEN'`)) { //user has not entered their own projectToken
                console.log(chalk.underline.yellow('Please enter your projectToken in visualTest.config.js.'));
            } else {
                console.log(chalk.blue(`projectToken found.`));
            }
        } else { //vtConf boilerplate does NOT look good
            fs.writeFileSync(filePath, fileContent.replace(/([\s\S])$/, `$1${vtConfContent}`));
            console.log(chalk.underline.yellow('Please enter your projectToken in visualTest.config.js.'));
        }
    } else { //file does not exist, so create the file and import boilerplate
        fs.appendFile('visualTest.config.js', vtConfContent, function (err) { if (err) throw err });
        console.log(chalk.green('visualTest.config.js has been created.'));
        process.stdout.write(chalk.yellow('Please enter your projectToken'));
        console.log(chalk.green(' in visualTest.config.js'));
    }
}
let setupCommands = () => {
    let filePath;
    if (usersCypress.version.split('.')[0] >= 10) {
        filePath = `${process.cwd()}/cypress/support/e2e.js`;
    } else {
        filePath = `${process.cwd()}/cypress/support/index.js`;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    if (fileContent.toString().includes(commandsImport)){
        console.log(chalk.blue(`Commands already installed.`));
    } else {
        fs.writeFileSync(filePath, fileContent.replace(/([\s\S])$/, `$1${commandsImport}`));
        console.log(chalk.green(`Commands installed.`));
    }
}
let setupPlugin = () => {
    let filePath;
    if (usersCypress.version.split('.')[0] >= 10) {
        filePath = path.resolve(process.cwd(), 'cypress.config.js');
    } else {
        filePath = `${process.cwd()}/cypress/plugins/index.js`;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    if (fileContent.toString().includes(pluginRequire)){
        console.log(chalk.blue(`Plugin already installed.`));
    } else {
        fs.writeFileSync(filePath, fileContent.replace(/([\s\S])$/, `$1${pluginRequire}`));
        console.log(chalk.green(`Plugin installed.`));
    }
}
checkForOlderVersion()
setupCommands()
setupPlugin()
setupVTConf()
