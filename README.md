# PocketAssistant
PocketAssistant is a cutting-edge calendar optimization tool that promotes activities to support health, wellness, and academic success.
PocketAssistant provides an easy-to-use interface for students to view and modify their calendar as well as receiving suggestions for activities to benefit their cardiovascular health. Students are also reminded of important events on their calendar to assist in accomplishing the numerous activities in their busy schedules.

## Download and Installation
1. Clone the repo: `git clone https://github.com/eecs394-spr15/PocketAssistant.git`
2. Install Supersonic following the steps at the following link https://academy.appgyver.com/installwizard
3. Navigate to the directory containing PocketAssistant
4. From the command line in this directory, update the dependencies: `steroids update`
5. From the command line, start the app: `steroids connect`
  - This will open a page in your browser with a scannable QR code.
6. Download the Appgyver Scanner app on your ios device at https://itunes.apple.com/us/app/appgyver-scanner/id575076515?mt=8
  - You can also launch this app on the iOS simulator. Steps for getting this set up can be found at http://docs.appgyver.com/tooling/cli/emulators/ios-simulator/
7. Scan the QR code in your browser created in step 5

## Setting up Cloud Deployment 
Cloud deployment allows you to generate a publicly share-able QR code like the one generated in the above steps. This allows you to share your application with anyone using Appgyver.

1. Select the 'Cloud' tab from the steroids connect page in your browser.
2. Select 'Deploy to Cloud'
3. Select 'Open Cloud Share Page'
4. Scan the QR code provided at the resulting page
  - This link is shareable with everyone!

## Setting up Google API access
1. Use [this wizard](https://console.developers.google.com/start/api?id=calendar) to create or select a project in the Google Developers Console and automatically enable the API.
2. In the sidebar on the left, select Consent screen. Select an EMAIL ADDRESS and enter a PRODUCT NAME if not already set and click the Save button.
3. In the sidebar on the left, select Credentials and click Create new Client ID.
4. Select the application type Web application.
5. In the Authorized JavaScript Origins field enter the URL http://localhost.
6. In the Redirect URIs field, enter the URL http://localhost.
7. Create a new Public API Key by clicking "Create new Key" under the Public API access heading
8. In IndexController.js change the value of the clientId variable to be your ClientID obtained in the previous steps.
9. Change the value of the apiKey variable to be your Api Key obtained in the previous steps.

## Known Bugs and Limitations
- PocketAssistant is currently compatible with iOS devices only
- After authenticating with google calendar on the initial app startup, you must restart the application.
- Suggestions are not context dependent, and are made in only 1 hour and 30 minute time blocks.
- You currently cannot log out of the Google account associated with the application without deleting the application altogether.
