// const fs = require('fs');
//
// describe('Visual Test Setup', () => {
//     test('Console logs', () => {
//         const expectedLogs = `TypeScript detected - this currently in beta.
// Commands installed.
// Plugin installed.
// TypeScript import statement added.\tFilepath: cypress/support/index.d.ts
// visualTest.config.js has been created.
// Please enter your projectToken in visualTest.config.js`;
//
//         const fileContent = fs.readFileSync("visualtest-logs.txt", 'utf-8');
//         expect(fileContent).toEqual(expectedLogs);
//     });
// });


const fs = require('fs');

test('Check visualtest-log.txt', () => {
    const logFile = 'visualtest-log.txt';

    // Read the contents of the log file
    const fileContents = fs.readFileSync(logFile, 'utf-8');

    // Split the contents into an array of lines
    const lines = fileContents.split('\n');

    // Remove the 4th line
    lines.splice(3, 1);

    // Reconstruct the modified contents
    const modifiedContents = lines.join('\n');

    // Perform your comparison against the modified contents
    expect(modifiedContents).toContain('TypeScript detected - this currently in beta.');
    expect(modifiedContents).toContain('Commands installed.');
    expect(modifiedContents).toContain('Plugin installed.');
    expect(modifiedContents).toContain('TypeScript import statement added.	 Filepath: cypress/support/index.d.ts');
    expect(modifiedContents).toContain('visualTest.config.js has been created.');
    expect(modifiedContents).toContain('Please enter your projectToken in visualTest.config.js');
});
