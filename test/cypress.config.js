const {defineConfig} = require("cypress");
const chalk = require("chalk");
const deletePastReports = require("./utils/deletePastReports")
const generateReports = require("./utils/generateReports")


module.exports = defineConfig({
    experimentalWebKitSupport: true,
    // viewportWidth: 1920,
    // viewportHeight: 1080,
    reporterOptions: {
        html: false,
        json: true,
        timestamp: "mm-dd-yyyy_HH-MM-ss",
        quiet: true
    },
    bail: true,
    video: false,
    e2e: {
        setupNodeEvents(on) {
            on('before:run', (results) => {
                if (results.config.reporter === "mochawesome") {
                    deletePastReports()
                }
            })
            on('after:run', (results) => {
                //todo fix the sbvt after test report being overwritten

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
        process.stdout.write(chalk.bgRedBright(`there was ${results.totalFailed} ${results.totalFailed === 1 ? 'failure' : 'failures'}`));
        process.stdout.write(`\t`);
    }
    if (results.totalPassed) {
        console.log(chalk.green(`there was ${results.totalPassed} passed ${results.totalPassed === 1 ? 'test' : 'tests'}\t`));
    }
}

