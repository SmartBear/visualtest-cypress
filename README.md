
# Cypress VisualTest Plugin

### Requirements
 - Cypress v6.7.0+ (Recommend v10.10.0+)

## Setup
Run ```npm install @smartbear/visualtest-cypress```

Run ```npx visualtest-setup``` , **this will**:
 - Add: ```require('@smartbear/visualtest-cypress')(module);``` at the bottom of **cypress.config.js**
 - Add: ```import '@smartbear/visualtest-cypress/commands'``` at the bottom of cypress/support/**e2e.js**
 - Create **visualTest.config.js** in the main test folder
   -  that file will contain:
   ```module.exports = { projectToken: 'PROJECT_TOKEN' }```
 
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
 
---

## Changelog
#### [1.0.0-beta.10](https://www.npmjs.com/package/@smartbear/visualtest-cypress/v/1.0.0-beta.10)
Device info is now returned via API call.

#### [1.0.0-beta.8](https://www.npmjs.com/package/@smartbear/visualtest-cypress/v/1.0.0-beta.8)
Update the reporting syntax to check a different api so longer needing to loop through comparison results.

#### [1.0.0-beta.6](https://www.npmjs.com/package/@smartbear/visualtest-cypress/v/1.0.0-beta.6)
After test report loops through pages, if bigger than 100 results.

#### [1.0.0-beta.5](https://www.npmjs.com/package/@smartbear/visualtest-cypress/v/1.0.0-beta.5)
Small bug squashes to the after test report.

#### [1.0.0-beta.4](https://www.npmjs.com/package/@smartbear/visualtest-cypress/v/1.0.0-beta.4)
Introducing after test reports.

