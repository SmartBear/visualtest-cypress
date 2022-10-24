
# Cypress VistualTest Plugin

## Setup


Run ```npm install @smartbear/sbvt-cypress@latest```

(If that failed you're not logged in, create a personal access token on github, then ```npm login --scope=@smartbear --registry=https://npm.pkg.github.com```)

Run ```npx sbvt-setup``` , **this will**:
 - Add: ```require('@smartbear/sbvt-cypress')(module);``` at the bottom of **cypress.config.js**
 - Add: ```import '@smartbear/sbvt-cypress/commands'``` at the bottom of cypress/support/**e2e.js**
 - Create **visualTest.config.js** in the main test folder
   -  that file will contain:
   ```module.exports = { projectToken: 'PROJECT_TOKEN', testRunName: 'My first test' }```
 
## Implementation
 Simply change all instances of ```cy.screenshot``` with ```cy.sbvtCapture```.

For example, this will run regression tests agaist **Fullpage Home Capture** in that project
```
cy.sbvtCapture('Fullpage Home Capture')
```

You can also run tests agaist just certain elements, this will run regression tests agaist the header.
```
cy.get('.container').eq(0).sbvtCapture('Capture of the homepage header')
```

To pass in other [arguments](https://docs.cypress.io/api/commands/screenshot#Arguments) , the syntax would be the same as ```cy.screenshot```
```
cy.sbvtCapture('Clipping the homepage viewport', { 
      capture: 'viewport', 
      overwrite: true, 
      clip: {x: 100, y: 100, width: 1000, height: 1000},
})
```

**The callback argumenets are not allowed, i.e. ```onBeforeScreenshot``` & ```onAfterScreenshot```**
## Running
 - ```npx cypress run``` is the recommended way to run our plugin. After the run completes there will be a print out saying ```Your X captures can be found under testRunId: XXXXXX```
 - Going into 'interactive mode' (```npx cypress open```) works, but each test can only be ran once without closing and relauching the Cypress application.
 
