const {defineConfig} = require("cypress");
const chalk = require("chalk");
const deletePastReports = require("./utils/deletePastReports")
const generateReports = require("./utils/generateReports")


module.exports = defineConfig({
    // viewportWidth: 1920,
    // viewportHeight: 1080,
    // reporterOptions: {
    //     html: false,
    //     json: true,
    //     timestamp: "mm-dd-yyyy_HH-MM-ss",
    //     quiet: true
    // },
    bail: true,
    video: false,
    e2e: {
        setupNodeEvents(on) {
            on('before:browser:launch', (browser, launchOptions) => {
                if (browser.name === 'chrome' && browser.isHeadless) {
                    // fullPage screenshot size is 1400x1200 on non-retina screens
                    // and 2800x2400 on retina screens
                    launchOptions.args.push('--window-size=1400,1200')
                    // force screen to be non-retina (1400x1200 size)
                    launchOptions.args.push('--force-device-scale-factor=1')
                    // force screen to be retina (2800x2400 size)
                    // launchOptions.args.push('--force-device-scale-factor=2')
                }
                if (browser.name === 'electron' && browser.isHeadless) {
                    // fullPage screenshot size is 1400x1200
                    launchOptions.preferences.width = 2000
                    launchOptions.preferences.height = 1250
                }
                if (browser.name === 'firefox' && browser.isHeadless) {
                    // menubars take up height on the screen
                    // so fullPage screenshot size is 1400x1126
                    launchOptions.args.push('--width=1400')
                    launchOptions.args.push('--height=1200')
                }
                return launchOptions
            })
            // on('before:run', (results) => {
            //     if (results.config.reporter === "mochawesome") {
            //         deletePastReports()
            //     }
            // })
            // on('after:run', (results) => {
            //     //todo fix the sbvt after test report being overwritten
            //
            //     if (results.config.reporter === "mochawesome") {
            //         generateReports()
            //         printResults(results)
            //     }
            // })
        },
    },
});

require('@smartbear/visualtest-cypress')(module)

// const printResults = (results) => {
//     if (results.totalFailed) {
//         process.stdout.write(chalk.bgRedBright(`there was ${results.totalFailed} ${results.totalFailed === 1 ? 'failure' : 'failures'}`));
//         process.stdout.write(`\t`);
//     }
//     if (results.totalPassed) {
//         console.log(chalk.green(`there was ${results.totalPassed} passed ${results.totalPassed === 1 ? 'test' : 'tests'}\t`));
//     }
// }

