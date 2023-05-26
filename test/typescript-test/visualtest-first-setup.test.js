const fs = require('fs');

describe('Visual Test Setup', () => {
    test('Console logs', () => {
        const expectedLogs = `TypeScript detected - this currently in beta.
Commands installed.
Plugin installed.
TypeScript import statement added.\tFilepath: cypress/support/index.d.ts
visualTest.config.js has been created.
Please enter your projectToken in visualTest.config.js`;

        const fileContent = fs.readFileSync("visualtest-logs.txt", 'utf-8');
        expect(fileContent).toEqual(expectedLogs);
    });
});
