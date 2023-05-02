const execSync = require('child_process').execSync;

const generateTestReport = () => {

    const mergeCommand = 'npx mochawesome-merge mochawesome-report/*.json -o mochawesome-report/merged.json';
    const reportCommand = 'npx marge mochawesome-report/merged.json';
    const openCommand = 'open mochawesome-report/merged.html || start mochawesome-report/merged.html';

    try {
        process.stdout.write('merging all mochawesome reports!...');
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