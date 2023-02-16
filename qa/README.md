# To test

make sure in root folder to ```npm i```


then cd into qa folder & run:
``` 
./script.sh
```

logs can be turned on in visualtest.config.js file ```log: "trace"```

---

### to run custom tests

just add ANOTHER describe to the bottom of the cypress/e2e/spec.cy.js file

a good one to copy is the "testing lazy loading" describe and just tact it on the bottom ( make your custom test ) and it will run with ```./script.sh``` 