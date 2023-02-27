#! /bin/bash
if [ "$1" == "full" ] || [ "$1" == null ]
then
  echo Running the FULL Cypress local test
  npm install cypress@latest

  viewportWidth=( 1366 1920)
  viewportHeight=(768  1080)
  #  browsers=(chrome electron firefox)
  browsers=(electron)
  #  variations=(Original ColorDiff FontDiff MissingElement ContentDiff)
  variations=(Original ContentDiff)

  testCount=0
  for name in "${variations[@]}";
  do
    sed -i'.toBeRemoved' -e "s/let variation.*/let variation = \'$name\'/g" cypress/e2e/spec.cy.js
    for browser in "${browsers[@]}";
    do
      for ((i = 0; i < ${#viewportWidth[@]}; i++))
      do
        (( testCount++ )) || true
        sed -i'.toBeRemoved' -e "s/viewportWidth:.*/viewportWidth: ${viewportWidth[i]},/g" cypress.config.js
        sed -i'.toBeRemoved' -e "s/viewportHeight:.*/viewportHeight: ${viewportHeight[i]},/g" cypress.config.js
        sed -i'.toBeRemoved' -e "s/testRunName:.*/testRunName: \'$browser on $name - ${viewportWidth[i]} x ${viewportHeight[i]}\',/g" visualTest.config.js
        npx cypress run -q --spec "cypress/e2e/spec.cy.js" -b $browser
        echo Finished $testCount / "`expr ${#viewportWidth[@]} \* ${#variations[@]} \* ${#browsers[@]}`": $browser on $name - "${viewportWidth[i]}" x "${viewportHeight[i]}"
      done
    done
  done

  sed -i'.toBeRemoved' -e "s/let variation.*/let variation = \'FILLER_DATA_DONT_TOUCH_THIS_LINE\'/g" cypress/e2e/spec.cy.js
  rm cypress/e2e/spec.cy.js.toBeRemoved # no way around this on mac... https://stackoverflow.com/questions/21242932/sed-i-may-not-be-used-with-stdin-on-mac-os-x/21243111#21243111
  sed -i'.toBeRemoved' -e "s/viewportWidth:.*/viewportWidth: \'FILLER_DATA_DONT_TOUCH_THIS_LINE\',/g" cypress.config.js
  sed -i'.toBeRemoved' -e "s/viewportHeight:.*/viewportHeight: \'FILLER_DATA_DONT_TOUCH_THIS_LINE\',/g" cypress.config.js
  rm cypress.config.js.toBeRemoved # no way around this on mac... https://stackoverflow.com/questions/21242932/sed-i-may-not-be-used-with-stdin-on-mac-os-x/21243111#21243111
  sed -i'.toBeRemoved' -e "s/testRunName:.*/testRunName: \'FILLER_DATA_DONT_TOUCH_THIS_LINE\',/g" visualTest.config.js
  rm visualTest.config.js.toBeRemoved # no way around this on mac... https://stackoverflow.com/questions/21242932/sed-i-may-not-be-used-with-stdin-on-mac-os-x/21243111#21243111
fi
if [ "$1" == "quick" ]
then
  echo running quick test
  npx cypress run -q --spec 'cypress/e2e/quick.cy.js'
fi

