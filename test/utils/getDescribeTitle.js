const getDescribeTitle = (specName, currentTestCase) => {
    let describeTitle = `${specName} / ${currentTestCase.name}`;
    describeTitle += currentTestCase.options && (currentTestCase.options.lazyload ||  currentTestCase.options.ignoreElements) || currentTestCase.validation && currentTestCase.validation.freezePageResult ? `\ttesting: ` : ''
    describeTitle += currentTestCase.options && currentTestCase.options.lazyload ? `lazyload\t` : ''
    describeTitle += currentTestCase.options && currentTestCase.options.ignoreElements ? `ignoreElements\t` : ''
    describeTitle += currentTestCase.scrollViewport ? `scrolling\t` : ''
    describeTitle += currentTestCase.validation && currentTestCase.validation.freezePageResult ? `freezePage\t` : ''
    return describeTitle
}

module.exports = getDescribeTitle;