const getDescribeTitle = (specName, currentTestCase) => {
    let describeTitle = `${specName} / ${currentTestCase.name}`;
    describeTitle += currentTestCase.options && currentTestCase.options.lazyload || currentTestCase.options && currentTestCase.options.ignoreElements ? `.\tTesting: ` : ''
    describeTitle += currentTestCase.options && currentTestCase.options.lazyload ? `lazyload for ${currentTestCase.options.lazyload}\t` : ''
    describeTitle += currentTestCase.options && currentTestCase.options.ignoreElements ? `ignoreElements for ${currentTestCase.options.ignoreElements}` : ''
    return describeTitle
}

module.exports = getDescribeTitle;