const {platform} = require("os");
const chalk = require("chalk");
const execSync = require('child_process').execSync;
const generateTestReport = () => {
    let mergeCommand, reportCommand, openCommand;
    if (platform() === 'win32') {
        mergeCommand = `npx mochawesome-merge mochawesome-report\\*.json -o mochawesome-report\\merged.json`;
        reportCommand = 'npx marge mochawesome-report\\merged.json'
        openCommand = 'start mochawesome-report\\merged.html'
    } else {
        mergeCommand = 'npx mochawesome-merge mochawesome-report/*.json -o mochawesome-report/merged.json';
        reportCommand = 'npx marge mochawesome-report/merged.json';
        openCommand = 'open mochawesome-report/merged.html'
    }

    try {
        process.stdout.write(chalk.dim(`platform detected: `))
        process.stdout.write(chalk.bold.yellow(`${platform()}\t`))
        process.stdout.write('merging reports!...');
        execSync(mergeCommand);
        process.stdout.write('\tgenerating report!...');
        execSync(reportCommand);
        process.stdout.write('\topening report!\n');
        execSync(openCommand);
    } catch (error) {
        console.error('Failed to generate test report:', error);
        process.exit(1);
    }
}

module.exports = generateTestReport;