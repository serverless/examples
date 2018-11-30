const { Chromeless } = require('chromeless')
const  tv4  = require('tv4');
const assert = require('assert');
const yaml = require('js-yaml');
const fs   = require('fs');

run = async ()=> {
  try {
    const test = yaml.safeLoad(fs.readFileSync("./config/default_test.yml"));
    const chromeless = new Chromeless()
    const json = await chromeless
      .clearCache()
      .clearCookies()
      .goto(test.URL)
      .wait(2000)
      .type(test.EMAIL , test.EMAIL_INPUT_BOX)
      .type(test.PASSWORD, test.PASSWORD_INPUT_BOX)
      .click(test.SUBMIT)
      .wait(5000)
      .click(test.ALLOW)
      .wait(3000)
      .evaluate(() => document.querySelector('body pre').innerHTML)
  
    const schema = {
      type: 'object' ,
      properties : {
        "access_token" : {
          "type" : "string"
        }                  
      },
      "required" : ["access_token"]
    }

    assert.equal(tv4.validate(JSON.parse(json),schema,true),true)
    await chromeless.end()

  } catch (error) {
      assert.fail(error);
  }
}

describe("Test :- Dropbox " , () => {
  it("Test Dropbox :- User Authorization With OAuth", async () => {
    const response = await run()
  }).timeout(15000)
})