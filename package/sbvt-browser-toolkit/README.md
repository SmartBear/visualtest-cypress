 # visual-testing-dom-toolkit
Tools for capturing web page state as JSON via the DOM

## Minifying dom-capture.js
To get the minified file after making changes run ```npm run build```
To get the minified file with console.logs enabled run ```npm run build -- debug```

## Testing (Mac only)
### First download
When you run ```npm i``` it will download chromedriver and geckodriver. 
For Safari you'll need to open up your local Safari and click the 'Develop' tab, then towards the bottom of the dropdown click 'Allow Remote Automation'

### Run local and remote tests with CBT and Bitbar
Take the .env.example file and rename it to .env along with inputting your credentials. 
```npm test``` will execute mocha and run tests on your local envoirnment, CBT, Bitbar and capture the domCapture file with some preset tests


# npm updates
## 1.1.0
Added an ```index.js``` file the uses ```fs``` to return the file
### to use  
```const domCaptureScript = require('@smartbear/dom-toolkit')```  
Now, ```domCaptureScript``` will be the variable where the minifed domCapture file will be stored

## Publish to GitHub Packages

This will make the package available on the @smartbear/dom-toolkit scope using the .npmrc file. 

Prerequisites:

* Build the latest minified version 
* Bump the version in package.json
* Push all your changes to github
* Ensure you have a [GitHub Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)

```shell
npm login --scope=@smartbear --registry=https://npm.pkg.github.com
Username: <github username>
Password: <github personal access token>
Email: <smartbear email>

npm publish
```
