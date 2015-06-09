describe('my app', function() {
	describe('view1', function() {
		beforeEach(function() {
			browser.driver.get('http://localhost:8000/app/index.html#/view1');
		});
		it('should render view1 when user navigates to /view1', function() {
			browser.driver.ignoreSynchronization = true;
			element(by.buttonText("Click here to get your Calendar!")).click();
			element(by.buttonText("Click here to get your Calendar!")).click();
			browser.driver.sleep(30000);
			element(by.buttonText("Add")).click();
			browser.driver.sleep(2000);
			element(by.model("updateData.summary")).sendKeys("Test Event");
		});
	});
});
