describe(`running quick test`, () => {
    beforeEach('visit', () => {
        cy.visit(`https://www.glds.com/`)
    })
    it('should take a fullpage sbvtCapture', function () {
        cy.sbvtCapture('glds NOT lazy loaded', {
            test
        })
    });
})