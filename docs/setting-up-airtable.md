# Setting up integration with Airtable

Constellate is designed to allow importing of informtion from an existing Airtable as a way to bootstrap a set of user profiles, or augment existing data if they already exist.

https://pyairtable.readthedocs.io/en/stable/index.html) to connect to a predefined Airtable from the application, somewhat like the the Slack and Google Sheets Importers.

Once you have defined which Airtable to query, which table in the Airtable, and set up necessary authentication credentials, you can perform a one way sync from the specified table into the database using the following management command:

```
./manage.py import_users_from_airtable
```

You have the option of making a per user import option avaibale for users, allowing them to run import information they have added, on their own schedule. This can be helpful to allow users control of what information they want to move across.

## Defining which Airtable 'base' to fetch data from 


The Airtable Base to fetch data from is defined by the AIRTABLE_BASE setting, which by default reads from the environment variable `DJANGO_AIRTABLE_BASE`. This should look like `appxxxxxxxxxxxxx`, where `x` is an alphanumeric character.

Once you have specificed which base to connect to, the table to fetch the data from is defined by `AIRTABLE_TABLE`. Similarly, this value is defined by the environment variable `DJANGO_AIRTABLE_TABLE`.

This should look like `tblxxxxxxxxxxxxxx` where `x` is an alphanumeric character.

So, if you're on a Airtable page with the at the following kind of URL:

https://airtable.com/appxxxxxxxxxxxxx/tblxxxxxxxxxxxxxx/viwxxxxxxxxxxxxxx?blocks=hide/

You would set the spreadsheet key to be:

```
DJANGO_AIRTABLE_BASE="appxxxxxxxxxxxxx"
DJANGO_AIRTABLE_TABLE="tblxxxxxxxxxxxxxx"
```

## Connecting with the correct credentials

You will need a personal access token to connect to the Airtable defined above from the Django application. The fastest way to create a token is to follow Airtable's page below which will guide you through creating a token:

https://airtable.com/developers/web/guides/personal-access-tokens


Once you have a token, you can authenticate against Airtable's servers by setting the `AIRTABLE_BEARER_TOKEN` value, which by default reads from the environment variable
 `DJANGO_AIRTABLE_BEARER_TOKEN` (seeing a pattern here?)

 Once you have these set, you can run a bulk import, as well as individual imports. 
 
 These both work up by updating an existing profile that matches the email address for the given row in the chosen table on Airtable. If there is no existing profile, the importer will create a new user and profile for that row.
