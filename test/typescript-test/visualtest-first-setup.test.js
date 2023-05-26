describe('Visual Test Setup', () => {
    test('Console logs', () => {
        const expectedLogs = `Commands installed.
Plugin installed.
TypeScript import statement added.  Filepath: cypress/support/index.d.ts
visualTest.config.js has been created.
Please enter your projectToken in visualTest.config.js`;

        const actualLogs = process.stdout.write.mock.calls.join('');
        expect(actualLogs).toEqual(expectedLogs);
    });
});
