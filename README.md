# Cypress VisualTest Plugin

### Documentation

For more detailed docs, visit: https://support.smartbear.com/visualtest/docs/sdks/cypress.html

## Setup

Run the following commands to setup & install VisualTest:

```shell
npm install @smartbear/visualtest-cypress
npx visualtest-setup
```

Example console output:

```console
Commands installed.
Plugin installed.
visualTest.config.js has been created.
Please enter your projectToken in visualTest.config.js
```

Enter your projectToken in visualTest.config.js:

```javascript
module.exports = {projectToken: 'PROJECT_TOKEN'}
```

## Implementation

Simply change all instances of ```cy.screenshot``` with ```cy.sbvtCapture```.

For example, this will run regression tests against **Fullpage Home Capture** in that project

```javascript
cy.sbvtCapture('Home Page')
```

To override project settings — take a capture with layout mode on low sensitivity

```javascript
cy.sbvtCapture('Home Page', {
    comparisonMode: 'layout', // if 'layout', then sensitivity is requried, OR 'detailed' with no sensitivity
    sensitivity: "low" // 'medium', or 'high'
})
```

For lazy-loaded websites use:

```javascript
cy.sbvtCapture('Home Page', {
    lazyload: 250 //number is milliseconds between scrolls 
})
```

To ignore elements on the comparison, add the cssSelector to the array:

```javascript
cy.sbvtCapture('Home Page', {
    ignoreElements: ['.exampleClass', '.class1 > div > li:nth-child(1)']
})
```

You can also run tests against just certain elements, this will run regression tests against the header.

```javascript
cy.get('.container').eq(0).sbvtCapture('Home Page Header')
```

To pass in other [arguments](https://docs.cypress.io/api/commands/screenshot#Arguments) , the syntax would be the same as ```cy.screenshot```

```javascript
cy.sbvtCapture('Home Page', {
    capture: 'viewport',
    overwrite: true,
    clip: {x: 100, y: 100, width: 1000, height: 1000}
})
```

To print out the test run results ```cy.sbvtPrintReport()```

To assert the test run use ```cy.sbvtGetTestRunResult()```, the return value will be ```passed``` and ```failed```

```javascript
{  // example cy.sbvtGetTestRunResult() response
    passed: 10
    failed: 0
}
```

```javascript
    it("The sbvtCapture's should pass", function () {
        cy.sbvtGetTestRunResult()
            .then((response) => {
                assert(response.passed === 10, `response.passed !== 10: ${JSON.stringify(response)}`);
                assert(response.failed === 0, `There were failures in the test run: ${JSON.stringify(response)}`);
            });
    });
```


Callback arguments are not allowed, i.e. ```onBeforeScreenshot``` & ```onAfterScreenshot```

## Running

- ```npx cypress run``` is the recommended way to run our plugin.
- Going into 'interactive mode' (```npx cypress open```) works, but each test can only be ran once without closing and relauching the Cypress application.

## Requirements

- Cypress v7.4.0+ (Recommend v10.10.0+)

## Manual Setup

- For manual setup:
    - On versions 10+
        - Add: ```require('@smartbear/visualtest-cypress')(module);``` at the bottom of **cypress.config.js**
        - Add: ```import '@smartbear/visualtest-cypress/commands'``` at the bottom of cypress/support/**e2e.js**

    - On versions 10-
        - Add: ```require('@smartbear/visualtest-cypress')(module);``` at the bottom of cypress/plugins/**index.js**
        - Add: ```import '@smartbear/visualtest-cypress/commands'``` at the bottom of cypress/support/**index.js**
    - Create **visualTest.config.js** in the main test folder
        - that file will contain:
          ```module.exports = { projectToken: 'PROJECT_TOKEN' }```
        - Insert your projectToken, or create a trial here: https://try.smartbear.com/visualtest
     


