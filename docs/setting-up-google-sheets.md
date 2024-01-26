# Setting up integration with Google Sheets

Constellate is designed to allow importing of informtion from an existing spreadsheet as a way to bootstrap a set of user profiles, or augment existing data if they already exist.

It relies on the helpful [gspread library](https://docs.gspread.org/) to connect to google spreadsheets from the application, somewhat like the the Slack and Airtable Importers.

Once you have defined a spreadsheet to query, and set up necessary authentication credentials, you can perform a one way sync from the spreadsheet into the database using the following management command:

```
./manage.py import_users_from_gsheets
```

## Defining which spreadsheet to fetch data from 

The spreadsheet to fetch data from is defined by the GSPREAD_KEY setting, which by default reads from the environment variable `DJANGO_GSPREAD_SPREADSHEET_KEY`. This takes the form of the key in a url when you can see when using Google Sheets.

So, if you're on a google spreadsheet at the following url:

https://docs.google.com/spreadsheets/d/1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1-1x1x1x

You would set the spreadsheet key to be:

```
DJANGO_GSPREAD_SPREADSHEET_KEY="1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1x1-1x1x1x"
```

## Connecting with the correct credentials

Google offers a confusing number of ways to connect to a spreadsheet via an API. The one supported in constellate is using _service accounts_. These are a little bit like dedicated accounts, with their own email addresses, that represent a server carrying out various actions, without being tied to a specific human user the way oauth tokens might be.

The email addresses take the following form, and are usually linked to a specific _project_ with google, allowing you to see at a glance if a service account is linked to your project:

BOT-NAME-USING-HYPHENS@PROJECT-NAME-USING-HYPHENS@iam.gserviceaccount.com

new-cat-importer@weekly-user-import.iam.gserviceaccount.com	

Rather than using a single token, gspread user the downloadable `service-account.json` file provided by Google that you can download. You can see the service accounts created for a given project by visiting the url below:

https://console.cloud.google.com/iam-admin/serviceaccounts/

For a given service account you can create and download credentials if you follow the existing hierarchy:

```
service accounts > (choose specific service account) > keys > add key > (create new key)
```

Creating a new key downloads a json file containing a set of credentials and private keys for connecting to a service, somewhat like you might use a single token.

Connecting this way is somewhat like using a 'bot' token for slack - see the authentication page on gspread for more:

For more, see the gspread docs:

https://docs.gspread.org/en/v5.10.0/oauth2.html

### Using a service account to connect to a spreadsheet

When you want to connect to a spreadsheet using a service account, that service account needs:

1. permissions granted to it just like another human connecting to the spreadsheet, 
2. a set of credentials to use to authenticate itself when connecting to the google sheets API.

#### Granting permissions

Assuming you have set up a service account with the email address like so:

import-bot@weekly-user-import.iam.gserviceaccount.com

Then you'll need to grant access from your spreadsheet, like you would with a real person. In the "share" option when granting access to a spreadsheet, you'll add the  `import-bot@weekly-user-import.iam.gserviceaccount.com` like adding any other email address.

#### Authenticating when connecting to the API

You need to tell the constellate server where the `service-account.json` file is to use when connecting to Google Sheets API. This is defined in the GSPREAD_SERVICE_ACCOUNT setting, which is set using the `DJANGO_GSPREAD_SERVICE_ACCOUNT_FILE_PATH` environment variable.

Make sure the file is accessible from by constellate server, and list the path to the file like so:

```
DJANGO_GSPREAD_SERVICE_ACCOUNT_FILE_PATH="./path-to.google.service-account.json"
```

Once these are set up, you should be able to query the spreadsheet using gspread's methods as outlined in the documentation:

https://docs.gspread.org/en/v5.10.0/user-guide.html

For more, see the `importers.py` , and `fetch_profile_info_from_gsheet` to see the specific code used to fetch data from google sheets for constellate.