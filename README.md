
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
module.exports = { projectToken: 'PROJECT_TOKEN' }
```

 
## Implementation
 Simply change all instances of ```cy.screenshot``` with ```cy.sbvtCapture```.

For example, this will run regression tests agaist **Fullpage Home Capture** in that project
```
cy.sbvtCapture('Fullpage Home Capture')
```

You can also run tests against just certain elements, this will run regression tests against the header.
```
cy.get('.container').eq(0).sbvtCapture('Capture of the homepage header')
```

For lazy loaded websites use:
```
cy.sbvtCapture('lazyloaded capture', { 
      lazyload: 250, //number is milliseconds between scrolls 
})
```

To ignore elements on the comparison:
```
cy.sbvtCapture('ignoreElements-example', {
      ignoreElements: ['.exampleClass', '.class1 > div > li:nth-child(1)'],
})
```

To pass in other [arguments](https://docs.cypress.io/api/commands/screenshot#Arguments) , the syntax would be the same as ```cy.screenshot```
```
cy.sbvtCapture('Clipping the homepage viewport', { 
      capture: 'viewport', 
      overwrite: true, 
      clip: {x: 100, y: 100, width: 1000, height: 1000},
})
```

**Callback arguments are not allowed, i.e. ```onBeforeScreenshot``` & ```onAfterScreenshot```**
## Running
 - ```npx cypress run``` is the recommended way to run our plugin.
 - Going into 'interactive mode' (```npx cypress open```) works, but each test can only be ran once without closing and relauching the Cypress application.


## Requirements
- Cypress v7.0.0+ (Recommend v10.10.0+)

## Manual Setup
- For manual setup:
   - On versions 10+
      - Add: ```require('@smartbear/visualtest-cypress')(module);``` at the bottom of **cypress.config.js**
      - Add: ```import '@smartbear/visualtest-cypress/commands'``` at the bottom of cypress/support/**e2e.js**

   - On versions 10-
      - Add: ```require('@smartbear/visualtest-cypress')(module);``` at the bottom of cypress/plugins/**index.js**
      - Add: ```import '@smartbear/visualtest-cypress/commands'``` at the bottom of cypress/support/**index.js**
   - Create **visualTest.config.js** in the main test folder
      -  that file will contain:
         ```module.exports = { projectToken: 'PROJECT_TOKEN' }```
      - Insert your projectToken, or create a trial here: https://try.smartbear.com/visualtest
     


