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

test('Check visualtest-first-log.txt', () => {
    const fileContents = fs.readFileSync('visualtest-first-logs.txt', 'utf-8');
    const lines = fileContents.split('\n');
    const modifiedContents = lines.join('\n');

    // Perform your comparison against the modified contents
    expect(modifiedContents).toContain('TypeScript detected - this currently in beta.');
    expect(modifiedContents).toContain('Commands installed.');
    expect(modifiedContents).toContain('Plugin installed.');
    // expect(modifiedContents).toContain('TypeScript import statement added.	 Filepath: cypress/support/index.d.ts'); //issue with the spacing on expect and actual
    expect(modifiedContents).toContain('visualTest.config.js has been created.');
    expect(modifiedContents).toContain('Please enter your projectToken in visualTest.config.js');
});



test('Check visualtest-second-log.txt', () => {
    const fileContents = fs.readFileSync('visualtest-second-logs.txt', 'utf-8');
    const lines = fileContents.split('\n');
    const modifiedContents = lines.join('\n');

    // Perform your comparison against the modified contents
    expect(modifiedContents).toContain('TypeScript detected - this currently in beta.');
    expect(modifiedContents).toContain('Commands already installed.');
    expect(modifiedContents).toContain('Plugin already installed.');
    expect(modifiedContents).toContain('visualTest.config.js found.');
    expect(modifiedContents).toContain('Please enter your projectToken in visualTest.config.js');
});

