/*describe("test", function() {
   expect(true).to.be(true);
});*/

/*var webdriver = require('selenium-webdriver'),
    SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer(pathToSeleniumJar, {
   port: 4444
});

server.start();

var driver = new webdriver.Builder().
    usingServer(server.address()).
    withCapabilities(webdriver.Capabilities.firefox()).
    build();

var assert = require('assert'),
    test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver');

test.describe('Google Search', function() {
   test.it('should work', function() {
      var driver = new webdriver.Builder().build();

      var searchBox = driver.findElement(webdriver.By.name('q'));
      searchBox.sendKeys('webdriver');
      searchBox.getAttribute('value').then(function(value) {
         assert.equal(value, 'webdriver');
      });

      driver.quit();
   });
});*/


var wd = require('wd');
var driver = wd.promiseChainRemote(process.env.SAUCE ? servers.sauce : servers.local);
driver.init(desired).nodify(done);

driver
    .contexts().then(function (contexts) { // get list of available views. Returns array: ["NATIVE_APP","WEBVIEW_1"]
        return driver.context(contexts[1]); // choose the webview context
    })

    // do some web testing
    .elementsByCss('.green_button').click()

    .context('NATIVE_APP') // leave webview context

    // do more native stuff here if we want

    .quit()

describe('angularjs homepage todo list', function() {
   it('should add a todo', function() {
      browser.get('https://angularjs.org');

      element(by.model('todoList.todoText')).sendKeys('write first protractor test');
      element(by.css('[value="add"]')).click();

      var todoList = element.all(by.repeater('todo in todoList.todos'));
      expect(todoList.count()).toEqual(3);
      expect(todoList.get(2).getText()).toEqual('write first protractor test');

      // You wrote your first test, cross it off the list
      todoList.get(2).element(by.css('input')).click();
      var completedAmount = element.all(by.css('.done-true'));
      expect(completedAmount.count()).toEqual(2);
   });
});