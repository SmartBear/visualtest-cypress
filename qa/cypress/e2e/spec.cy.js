let variation = 'FILLER_DATA_DONT_TOUCH_THIS_LINE'

describe(`Starting ${variation} Spec`, () => {

  beforeEach('visit', () => {
    cy.visit(`https://smartbear.github.io/visual-testing-example-website/Example1/${variation}/index.html`)
  })

  it('should take a fullpage sbvtCapture', function () {
    cy.sbvtCapture('fullpage')
  });

  it('should take a element sbvtCapture', function () {
    cy.get('.container').eq(2).sbvtCapture('element')
  });

  it('should take a viewport sbvtCapture', function () {
    cy.sbvtCapture('viewport', {
      capture: "viewport"
    })
  });
})
describe(`testing lazy loading`, () => {
  beforeEach('visit', () => {
    cy.visit(`https://www.glds.com/`)
  })
  it('should take a fullpage sbvtCapture', function () {
    cy.sbvtCapture('glds NOT lazy loaded', {
    })
  });
  it('should take a fullpage lazyload sbvtCapture', function () {
    cy.sbvtCapture('glds lazy loaded', {
      lazyload: 500
    })
  });
})