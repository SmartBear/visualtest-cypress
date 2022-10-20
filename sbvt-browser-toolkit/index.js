const fs = require('fs');

const getScript = filename => {
    return fs.readFileSync(__dirname + `/dist/${filename}.js`,{encoding:'utf8', flag:'r'});
};

const captureDomScript = getScript('dom-capture.min');
const freezePageScript = getScript('freeze-page.min');
const userAgentScript = getScript('user-agent.min');

module.exports = { captureDomScript, freezePageScript, userAgentScript };