const testCases = [
  {
    'name': 'VersionTest',
    'url': 'https://smartbear.github.io/visual-testing-example-website/Example1/Original/index.html',
    'options': {}
  }
];

const getDescribeTitle = require('../../../../utils/getDescribeTitle');

Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

const insertCustomFreezeScript = true;
testCases.forEach(currentTestCase => {
  let dataFromTest;
  describe(getDescribeTitle(Cypress.spec.name, currentTestCase), () => {
    it(`should take sbvtCapture`, () => {
      cy.visit(currentTestCase.url).then(() => {
        currentTestCase.options.debug = true;
        cy.wait(1500);
        cy.window()
            .then((win) => {
              cy.readFile("../../exampleFreezeCarousel.js").then((str) => {
                if (insertCustomFreezeScript) win.eval(str);
                cy.sbvtCapture(`${Cypress.version}-${currentTestCase.name}`, currentTestCase.options).then((data) => {
                  dataFromTest = data;
                  console.log("dataFromTest: ", dataFromTest);
                });
              });
            });
      });
    });
    it(`dom should have correct data`, () => {
      assert(dataFromTest.dom, 'DOM is missing');
      assert(dataFromTest.dom.error === false, 'DOM capture has an error');
      assert(dataFromTest.dom.fullpage.width && dataFromTest.dom.fullpage.height, 'DOM capture doesnt have fullpage width and height');
      assert(dataFromTest.dom.viewport.width && dataFromTest.dom.viewport.height, 'DOM capture doesnt have viewport width and height');
      assert(dataFromTest.dom.devicePixelRatio >= 1, 'DOM capture invalid devicePixelRatio');
      assert(dataFromTest.dom.dom.length >= 1, 'DOM elements missing');
      assert(dataFromTest.imageApiResult.imageType === 'fullpage', `DOM screenshotType invalid: ${dataFromTest.imageApiResult.imageType}`);
    })

    it(`apiPostResult should prove that Cypress is getting imageData properly`, () => {
      assert(parseInt(dataFromTest.imageApiResult.browserVersion) === parseInt(Cypress.browser.majorVersion), `Browser running and browser version sent on image do not match up - received: ${dataFromTest.imageApiResult.browserVersion}, running: ${Cypress.browser.majorVersion}`);
      assert(dataFromTest.imageApiResult.headless === Cypress.browser.isHeadless, `headless data does not match up - received: ${dataFromTest.imageApiResult.headless}, running: ${Cypress.browser.isHeadless} `);

      if (Cypress.browser.displayName.toLowerCase() === "electron") Cypress.browser.displayName = "chrome" //electron is basically chrome
      assert(dataFromTest.imageApiResult.browserName === Cypress.browser.displayName.toLowerCase(), `Browser running and browser name sent on image do not match up - received: ${dataFromTest.imageApiResult.browserName}, running: ${Cypress.browser.displayName}`);
    });

    it(`imageName should prove it is getting proper Cypress version`, () => {
      expect(dataFromTest.imageApiResult.imageName).to.include(Cypress.version);
    });

  });
});