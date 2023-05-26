const fs = require('fs');

test('Check visualtest-first-log.txt', () => {
    const fileContents = fs.readFileSync('visualtest-first-logs.txt', 'utf-8');

    expect(fileContents).toContain('TypeScript detected - this currently in beta.');
    expect(fileContents).toContain('Commands installed.');
    expect(fileContents).toContain('Plugin installed.');
    // expect(fileContents).toContain('TypeScript import statement added.	 Filepath: cypress/support/index.d.ts'); //issue with the spacing on expect and actual
    expect(fileContents).toContain('visualTest.config.js has been created.');
    expect(fileContents).toContain('Please enter your projectToken in visualTest.config.js');
});



test('Check visualtest-second-log.txt', () => {
    const fileContents = fs.readFileSync('visualtest-second-logs.txt', 'utf-8');

    expect(fileContents).toContain('TypeScript detected - this currently in beta.');
    expect(fileContents).toContain('Commands already installed.');
    expect(fileContents).toContain('Plugin already installed.');
    expect(fileContents).toContain('visualTest.config.js found.');
    expect(fileContents).toContain('Please enter your projectToken in visualTest.config.js');
});

