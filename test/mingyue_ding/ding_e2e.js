'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function() {

  /*browser.get('index.html');

  it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/view1");
  });*/


 describe('view1', function() {

    beforeEach(function() {
	browser.driver.get('http://localhost:8000/app/index.html#/view1');
    });


     it('should render view1 when user navigates to /view1', function() {
	 browser.driver.ignoreSynchronization = true;
	 element(by.buttonText("Click here to get your Calendar!")).click();
	 element(by.buttonText("Click here to get your Calendar!")).click();
	 //browser.sleep(20000);
	 //var email = browser.findElement(protractor.By.name('Email'));
	 //var email = element.by.attribute('Email');
	 //var email = $('#Email');
	 //var elem = element(by.buttonText("Email"));

	 browser.driver.sleep(30000);

	 element(by.buttonText("Add")).click();
	 browser.driver.sleep(2000);

	 element(by.model("updateData.summary")).sendKeys("Test Event");
	 browser.driver.sleep(5000);

	 element(by.model("updateData.start.dateTime")).sendKeys("2015-06-08T14:00:00-05:00");

	 element(by.model("updateData.end.dateTime")).sendKeys("2015-06-08T15:00:00-05:00");
	 
	 element(by.buttonText("Add Event")).click();
	 browser.driver.sleep(2000);
	 


	 
	 /*var username = element(By.id('input#Email'));
	 username.clear();
	 username.sendKeys('Jane Doe');*/

	 //var email = $("Email");
	 //email.click()
	 //var email = browser.driver.findElement(by.css('#Email'));
	 //var email = element(by.cssContainingText("input", "Email"));
	 //email.sendKeys('user@googleappsdomain.com');

	 /*var passwordInput = browser.driver.findElement(by.id('Passwd'));
	 passwordInput.sendKeys('pa$sWo2d');  //you should not commit this to VCS*/

	 /*var signInButton = browser.driver.findElement(by.id('signIn'));
	 signInButton.click();
	 browser.driver.sleep(20000);*/



	 
	 //elem.click().clear().sendKeys('John');
	 //var email = elem.getAttribute("Email");
	 //var password = $('#Password');
	 //var loginBtnElm = $('button[type=submit]')
	 //email.sendKeys('teambrown394@gmail.com');
	 //password.sendKeys('gochris394');
	 //loginBtnElm.click();

	 /*browser.sleep(3000);

	 it('non-angular page so ignore sync and active wait to load', function() {
	     browser.ignoreSynchronization = true;
	     browser.get(process.env.HOST + '/auth/github');
	     expect(loginNameInputElm.waitReady()).toBeTruthy();
	     expect(passwordInputElm.waitReady()).toBeTruthy();
	 });

	 it('should fill user and password and logins', function() {
	     loginNameInputElm.sendKeys(process.env.USERNAME);
	     passwordInputElm.sendKeys(process.env.PASSWORD);
	     loginBtnElm.click();
	 });*/
    });

  });


  /*describe('view2', function() {

    beforeEach(function() {
      browser.get('index.html#/view2');
    });


    it('should render view2 when user navigates to /view2', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });*/
});
