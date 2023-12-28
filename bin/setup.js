#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cwd = process.cwd();

const pluginRequire = `\nrequire('@smartbear/visualtest-cypress')(module)`;
const commandsImport = `\nimport '@smartbear/visualtest-cypress/commands'`;
let vtConfContent = `module.exports = {\n\tprojectToken: 'PROJECT_TOKEN',\n}`;
// const jsonData = `"chromeWebSecurity": false`;
let error = false;

const usersCypressVersion = (() => {
    let packageFile, usersCypress;
    try {
        packageFile = fs.readFileSync(path.resolve(path.dirname(require.resolve('cypress', {paths: [cwd]})), 'package.json'));
        usersCypress = JSON.parse(packageFile.toString());
    } catch (err) {
        error = true;
        console.log(chalk.bold.yellow('\nCypress not found, please run: '));
        console.log(chalk.magenta.underline(`npm install cypress\nnpx cypress open`));
        console.log((`Go through the Cypress setup wizard`));
        process.stdout.write(chalk.yellow(`Then, run: `));
        process.stdout.write(chalk.magenta.underline(`npx visualtest-setup`));
        console.log(chalk.yellow(` again.\n`));
    }
    return usersCypress;
})();

let cypressVersionAbove10; //boolean true if above version 10
let checkCypressVersion = () => {
    //checks if the user's version is supported, and if it above or below Cypress version 10 (due to different naming conventions)
    if (usersCypressVersion.version.split('.')[0] < 9 || usersCypressVersion.version.split('.')[0] <= 9 && usersCypressVersion.version.split('.')[1] < 4) {
        // Note as of now this is not supported because cy.request cannot send blobs in previous versions
        console.log(chalk.redBright(`Detected Cypress ${usersCypressVersion.version}`));
        console.log(chalk.green(`Only Cypress 9.4.0+ is supported`));
        // error = true; //todo not throwing an error for now
    }
    cypressVersionAbove10 = usersCypressVersion.version.split('.')[0] >= 10;
    checkForTypeScript(cypressVersionAbove10);

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
            console.log(chalk.bgRedBright('\n Then include the below line in your cypress.json file'))
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
            fs.readFileSync(version10 ? `${process.cwd()}/cypress/support/e2e.js` : `${process.cwd()}/cypress/support/index.js`, 'utf-8');
            fileExtension = ".js";
        } catch (error) {
            fs.readFileSync(version10 ? `${process.cwd()}/cypress/support/e2e.ts` : `${process.cwd()}/cypress/support/index.ts`, 'utf-8');
            fileExtension = ".ts";
            console.log(chalk.yellow('TypeScript detected - this currently in beta.'));
        }
    } catch (error) {
        //TODO look into logging later
        // logger.debug('Issue with finding file extension, defaulting to ".js".')
        // logger.debug('Most likely the Cypress project is not set up yet')
        fileExtension = ".js";
        // error handled later
    }
};

let setupVTConf = () => {
    /** logic for grabbing the projectToken**/
    let projectTokenArg = null;
    if (process.argv[2]) {
        projectTokenArg = inputUsersProjectToken();
        if (projectTokenArg) vtConfContent = `module.exports = {\n\tprojectToken: '${projectTokenArg}',\n}`;
    }

    const filePath = `${process.cwd()}/visualTest.config.js`;

    if (fs.existsSync(filePath)) { //file exists
        console.log(chalk.blue(`visualTest.config.js found.`));
        let fileContent = fs.readFileSync(filePath, 'utf-8');

        if (projectTokenArg) {
            if (fileContent.toString().includes('projectToken') && fileContent.toString().includes('module.exports')) { //vtConf boilerplate looks good, but no project token
                if (fileContent.toString().includes(`projectToken: 'PROJECT_TOKEN'`)) { // boiler plate config file setup
                    fileContent = fileContent.toString().replace(`projectToken: 'PROJECT_TOKEN',`, `projectToken: '${projectTokenArg}',`);
                    fs.writeFileSync(filePath, fileContent,'utf-8')
                    console.log(chalk.green(`"PROJECT_TOKEN" has been replaced with "${projectTokenArg}".`));
                } else if (fileContent.toString().includes(`projectToken: '${projectTokenArg}'`)){ //everything looks good
                    console.log(chalk.blue(`Your projectToken was found on visualtest.config.js.`));
                } else { //neither 'PROJECT_TOKEN' && projectTokenArg found (most likely a different projectToken saved)
                    logicToCheckForProjectTokenAndReplace(filePath, fileContent, projectTokenArg);
                }
            } else { //vtConf boilerplate does NOT look good, shouldn't get here often. It means the file is created, but no 'projectToken' && 'module.exports' hopefully empty file
                fs.appendFileSync(filePath, vtConfContent);
                console.log(chalk.green('Your projectToken has been written to visualTest.config.js.'));
            }
        } else {
            if (fileContent.toString().includes('projectToken') && fileContent.toString().includes('module.exports')) { //vtConf boilerplate looks good
                if (fileContent.toString().includes(`projectToken: 'PROJECT_TOKEN'`)) { //user has not entered their own projectToken
                    console.log(chalk.underline.yellow('Please enter your projectToken in visualTest.config.js.'));
                } else {
                    console.log(chalk.blue(`projectToken found.`));
                }
            } else { //vtConf boilerplate does NOT look good
                fs.appendFileSync(filePath, vtConfContent);
                console.log(chalk.underline.yellow('Please enter your projectToken in visualTest.config.js.'));
            }
        }
    } else { //file does not exist, so create the file and import boilerplate
        fs.appendFile('visualTest.config.js', vtConfContent, function (err) {
            if (err) throw err;
        });
        console.log(chalk.green('visualTest.config.js has been created.'));
        if (!projectTokenArg){
            process.stdout.write(chalk.yellow('Please enter your projectToken'));
            console.log(chalk.green(' in visualTest.config.js'));
        } else {
            console.log(chalk.green('Your projectToken has been written to visualTest.config.js.'));
        }
    }
};

let setupCommands = () => {
    let aboveVersion10 = usersCypressVersion.version.split('.')[0] >= 10;
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
        fs.appendFileSync(`${supportPath}${fileExtension}`, commandsImport);

        console.log(chalk.green(`Commands installed.`));
    }
};
let setupPlugin = () => {
    let aboveVersion10 = usersCypressVersion.version.split('.')[0] >= 10;
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
        fs.appendFileSync(`${supportPath}${fileExtension}`, pluginRequire);

        console.log(chalk.green(`Plugin installed.`));
    }
};

const setupTypeScriptIndexFile = () => {
    const filePath = path.join(process.cwd(), 'cypress', 'support', 'index.d.ts');
    const importStatement = "import '@smartbear/visualtest-cypress';\n";

    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        // okay if this file was not found
    }

    if (fileContent && fileContent.toString().includes(importStatement)) {
        console.log(chalk.blue(`TypeScript import statement found.`));
    } else {
        fs.appendFileSync(filePath, importStatement);
        // fs.writeFileSync(`${filePath}`, fileContent.replace(/([\s\S])$/, `$1\n${importStatement}`));
        process.stdout.write(chalk.green(`TypeScript import statement added.`));
        console.log(chalk.dim(`\t Filepath: cypress/support/index.d.ts`));
    }
};

const inputUsersProjectToken = () => {
    const npxArgument = process.argv[2];
    if (npxArgument.startsWith("projectToken=") && npxArgument.split("projectToken=")[1]) {
        return npxArgument.split("projectToken=")[1]; // in case there is another "=" in the projectToken
    } else {
        // console.error("Argument passed through is not recognized. Please enter your PROJECT_TOKEN manually."); // probably not needed
    }
}

const logicToCheckForProjectTokenAndReplace = (filePath, fileContent, projectTokenArg) => {
    try {
        const projectTokenPattern = /^(?!\/\/)\s*projectToken:/m; // Regular expression pattern to match lines that start with "projectToken:" and isn't commented out
        const lines = fileContent.toString().split('\n');
        let foundProjectTokenLine = null;
        for (const line of lines) {
            if (projectTokenPattern.test(line)) {
                foundProjectTokenLine = line;
                break;
            }
        }

        if (foundProjectTokenLine) {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(`Would you like to replace: ${chalk.blue(foundProjectTokenLine.trim())} with: ${chalk.green(`projectToken: '${projectTokenArg}',`)} (y/n): `, (answer) => {
                if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                    fileContent = fileContent.toString().replace(foundProjectTokenLine, `\tprojectToken: '${projectTokenArg}',`);
                    fs.writeFileSync(filePath, fileContent, 'utf-8')
                    console.log(chalk.green('projectToken replaced on visualtest.config.js file.'));
                } else {
                    console.log(chalk.yellow('projectToken will not be replaced.'));
                }

                rl.close();
            });
        } else {
            console.log('Please set up you visualtest.confis.js file manually'); //shouldn't get here
        }
    } catch (e) {
        console.log('Please set up you visualtest.confis.js file manually. Error: ', e); //shouldn't get here
    }
}

if (!error) checkCypressVersion();
if (!error) setupCommands();
if (!error) setupPlugin();
if (!error && fileExtension === '.ts') setupTypeScriptIndexFile();
if (!error) setupVTConf();

