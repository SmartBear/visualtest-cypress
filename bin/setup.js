#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cwd = process.cwd();

const pluginRequire = `\nrequire('@smartbear/visualtest-cypress')(module)`;
const commandsImport = `\nimport '@smartbear/visualtest-cypress/commands'`;
const vtConfContent = `module.exports = {\n\tprojectToken: 'PROJECT_TOKEN',\n}`;
const jsonData = `"chromeWebSecurity": false`;
//TODO add try catch
const packageFile = fs.readFileSync(path.resolve(path.dirname(require.resolve('cypress', {paths: [cwd]})), 'package.json'));
const usersCypress = JSON.parse(packageFile.toString());
let error = false;

let cypressVersionAbove10; //boolean true if above version 10
let checkCypressVersion = () => {
    //checks if the user's version is supported, and if it above or below Cypress version 10 (due to different naming conventions)
    if (usersCypress.version.split('.')[0] < 7 || usersCypress.version.split('.')[0] <= 7 && usersCypress.version.split('.')[1] < 4) {
        // Note as of now this is not supported because cy.request cannot send blobs in previous versions
        console.log(chalk.redBright(`Detected Cypress ${usersCypress.version}`));
        console.log(chalk.green(`Only Cypress 7.4.0+ is supported`));
        error = true;
    }
    cypressVersionAbove10 = usersCypress.version.split('.')[0] >= 10;
    checkForTypeScript(cypressVersionAbove10)

    /**
    if we decide to support older versions commenting out for now

    else if ((usersCypress.version.split('.')[0] = 7 && usersCypress.version.split('.')[1] < 4)) {
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
     **/
};

let fileExtension; // this for either '.js' or '.ts'
const checkForTypeScript = (version10) => {
    try {
        try {
            fs.readFileSync(version10 ? `${process.cwd()}/cypress/support/e2e.js` : `${process.cwd()}/cypress/support/index.js`, 'utf-8')
            fileExtension = ".js"
        } catch (error) {
            fs.readFileSync(version10 ? `${process.cwd()}/cypress/support/e2e.ts` : `${process.cwd()}/cypress/support/index.ts`, 'utf-8')
            fileExtension = ".ts"
            console.log(chalk.yellow('TypeScript detected - this currently in beta.'));
        }
    } catch (error) {
        // error handled later
    }
}

let setupVTConf = () => {
    const filePath = `${process.cwd()}/visualTest.config.js`;

    if (fs.existsSync(filePath)) { //file exists
        console.log(chalk.blue(`visualTest.config.js found.`));
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        if (fileContent.toString().includes('projectToken') && fileContent.toString().includes('module.exports')) { //vtConf boilerplate looks good

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
        fs.appendFile('visualTest.config.js', vtConfContent, function (err) {
            if (err) throw err;
        });
        console.log(chalk.green('visualTest.config.js has been created.'));
        process.stdout.write(chalk.yellow('Please enter your projectToken'));
        console.log(chalk.green(' in visualTest.config.js'));
    }
};

let setupCommands = () => {
    let aboveVersion10 = usersCypress.version.split('.')[0] >= 10;
    const supportPath = aboveVersion10 ? `${process.cwd()}/cypress/support/e2e` : `${process.cwd()}/cypress/support/index`;

    let fileContent;
    try {
        fileContent = fs.readFileSync(`${supportPath}${fileExtension}`, 'utf-8');
    } catch (err) {
        error = true;
        console.log(chalk.red(`Cypress e2e.js file not found, this is most likely due to Cypress not being setup yet, please run: `));
        console.log("");
        console.log("\tnpx cypress open");
        console.log("");
        console.log(chalk.grey(`${err}`));
        return;
    }

    if (fileContent.toString().includes(commandsImport)) {
        console.log(chalk.blue(`Commands already installed.`));
    } else {
        fs.writeFileSync(`${supportPath}${fileExtension}`, fileContent.replace(/([\s\S])$/, `$1${commandsImport}`));
        console.log(chalk.green(`Commands installed.`));
    }
};
let setupPlugin = () => {
    let aboveVersion10 = usersCypress.version.split('.')[0] >= 10;
    const supportPath = aboveVersion10 ? path.resolve(process.cwd(), 'cypress.config') : `${process.cwd()}/cypress/plugins/index`;

    let fileContent;
    try {
        fileContent = fs.readFileSync(`${supportPath}${fileExtension}`, 'utf-8');
    } catch (err) {
        error = true;
        console.log(chalk.red(`Cypress cypress.config.js file not found, this is most likely due to Cypress not being setup yet, please run: `));
        console.log("");
        console.log("npx cypress open");
        console.log("");
        console.log(chalk.grey(`${err}`));
        return;
    }

    if (fileContent.toString().includes(pluginRequire)) {
        console.log(chalk.blue(`Plugin already installed.`));
    } else {
        fs.writeFileSync(`${supportPath}${fileExtension}`, fileContent.replace(/([\s\S])$/, `$1${pluginRequire}`));
        console.log(chalk.green(`Plugin installed.`));
    }
};

checkCypressVersion();
if (!error) setupCommands();
if (!error) setupPlugin();
if (!error) setupVTConf();
