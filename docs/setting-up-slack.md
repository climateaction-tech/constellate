# Slack support

Constellate integrates into slack in two main ways. 

1. It is designed to support users in a slack workspace signing in using the same credentials they used to sign into the slack, allowing you to restrict access to members of a particular slack.

2. It can import from a specified channel into an instance, to pre-populate a directory with users, profile photo and other information in slack.

## Sign In via slack

To support sign-in via slack, you need to create an slack app, on the slack developer site, at the link below:

https://api.slack.com/apps

Once you've created an app, you'll need to set the following environment variables to identify, and authenticate your application when redirecting users to slack to sign in.

```
DJANGO_SLACK_CLIENT_ID="xxxxxxxxxxxx.xxxxxxxxxxxxx"
DJANGO_SLACK_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

You'll also need to set the correct worksapce to send users to when signing in, so they sign into the correct workspace:

```
DJANGO_SLACK_SIGNIN_AUTHORIZE_URL="https://your-workspace-name.slack.com/openid/connect/authorize"
```

With these set up, users will be able to sign using their slack credentials.


## Import users from a channel

In addition to creating users when they sign in via slack, it's possible to create batches of users, by importing all the members in a named channel.

This requires _different_ tokens with slack, because rather than using OAuth, to allow a user to sign in on behalf of a user, it is the _application_ itself connecting to the slack API and fetching information. The importer uses a _bot token_ identifiable by the first few characters showing as `xoxb-`:

```
DJANGO_SLACK_TOKEN="xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
```

You also need to identify a specific channel to import users from: 

```
DJANGO_SLACK_CHANNEL_NAME="my-fave-channel"
```

Once these are set, you can import all the users in the specified channel using the following management command:

```
./manage.py import_users_from_slack
```

Once you have run the import, the users with their profile photos will be visible in the running constellate instance.

_**Note**_: this is intended for groups of less than 100 users. _No attempt_ has been made to make this work for importing large channels in the hundreds or thousands of users, and using it will likely get you rate limited.