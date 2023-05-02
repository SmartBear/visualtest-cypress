const {defineConfig} = require("cypress");
const chalk = require("chalk");
const deletePastReports = require("./bin/deletePastReports")
const generateReports = require("./bin/generateReports")


module.exports = defineConfig({
    // viewportWidth: 1920,
    // viewportHeight: 1080,
    reporterOptions: {
        overwrite: false,
        html: false,
        json: true,
        timestamp: "mm/dd/yyyy_HH|MM|ss",
        console: false
    },
    bail: true,
    video: false,
    e2e: {
        setupNodeEvents(on) {
            on('before:run', (results) => {
                if (results.config.reporter === "mochawesome") deletePastReports()
            })
            on('after:run', (results) => {
                // over write this... figure out a better solution eventually

                if (results.config.reporter === "mochawesome") {
                    generateReports()
                    printResults(results)
                }
            })
        },
    },
});

require('@smartbear/visualtest-cypress')(module)

const printResults = (results) => {
    if (results.totalFailed) {
        process.stdout.write(`\t`);
        process.stdout.write(chalk.bgRedBright(`there was ${results.totalFailed} ${results.totalFailed === 1 ? 'failure' : 'failures'}`));
    }
    if (results.totalPassed) {
        process.stdout.write(`\t`);
        process.stdout.write(chalk.green(`there was ${results.totalPassed} passed ${results.totalPassed === 1 ? 'test' : 'tests'}`));
    }
}

