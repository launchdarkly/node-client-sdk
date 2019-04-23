# LaunchDarkly Client-Side Node SDK

[![Circle CI](https://circleci.com/gh/launchdarkly/node-client-sdk.svg?style=svg)](https://circleci.com/gh/launchdarkly/node-client-sdk)

# This is a beta release

This SDK should not be used in production environments until a final version is released.

## LaunchDarkly overview

[LaunchDarkly](https://www.launchdarkly.com) is a feature management platform that serves over 100 billion feature flags daily to help teams build better software, faster. [Get started](https://docs.launchdarkly.com/docs/getting-started) using LaunchDarkly today!
 
[![Twitter Follow](https://img.shields.io/twitter/follow/launchdarkly.svg?style=social&label=Follow&maxAge=2592000)](https://twitter.com/intent/follow?screen_name=launchdarkly)

## Introduction

This is the official LaunchDarkly JavaScript SDK for client-side [Node.js](https://nodejs.org/) applications. Its API closely resembles the LaunchDarkly [JavaScript SDK for browsers](https://github.com/launchdarkly/js-client), minus a few browser-specific features.

The SDK provides the same functionality as all of the LaunchDarkly SDKs:

* Making feature flags available to your application code.
* Sending events to LaunchDarkly for analytics and/or A/B testing.

Like the browser SDK, this SDK is _client-side_-- that is, it is meant to be used with code that is deployed to an end user, in a desktop application or a smart device. It does not use the SDK key that the server-side SDKs use, since an end user who acquired that key could use it to access the details of your LaunchDarkly environment; instead, it uses the "client-side ID" associated with your environment.

Note that in order for LaunchDarkly to make your feature flags available to these SDKs, you must check the "Make this flag available to client-side SDKs" box on the Settings page for each flag. This is so that if you have a web application with a large number of flags used on the server side and a smaller number used on the front end, the client-side SDK can save bandwidth by only getting the subset of flags that it will use.

## Why use this instead of the server-side Node SDK?

The [LaunchDarkly Server-Side Node SDK](https://github.com/launchdarkly/node-client) also runs in Node and has a similar API. However, it is meant for server-side use, not for applications that are distributed to users. There are several reasons why this distinction matters:

- The server-side SDKs include an SDK key that can download the entire definition (including rollout rules and individual user targets) of all of your feature flags. If you embed this SDK key in an application, any user who looks inside the application can then access all of your feature flag definitions—which may include sensitive data such as other users' email addresses. The client-side and mobile SDKs use different credentials that do not allow this.

- The server-side SDKs do in fact download your entire flag data using this key, since they have to be able to evaluate flags quickly for any user. That can be quite a large amount of data. The client-side and mobile SDKs, which normally evaluate flags for just one user at a time, use a much more efficient protocol where they request only the active variation for each flag for that specific user.

## Supported Node versions

This version of the SDK has been tested with Node versions 6.14 and up.

## Installation

Install the `launchdarkly-node-client-sdk` package in your project with `npm`:

    npm install --save launchdarkly-node-client-sdk

## Usage

### Initializing the client

To create a client instance, pass your environment's client-side ID (available on your [account settings page](https://app.launchdarkly.com/settings#/projects)) and user context to the `initialize` function:

```js
var ld = require('launchdarkly-node-client-sdk');

var user = { key: 'example' };
var options = {};
var client = ld.initialize('YOUR_CLIENT_SIDE_ID', user, options);
```

The user object can contain any of the properties described [here](https://docs.launchdarkly.com/docs/targeting-users). The SDK always has a single current user; you can change it after initialization (see "Changing users"). If you want the SDK to generate a unique key for the user, omit the `key` property and set the `anonymous` property to `true`.

The client is initialized asynchronously, so if you want to determine when the client is ready to evaluate feature flags, use the `ready` event, or the Promise-based method `waitForInitialization()`:

```js
client.on('ready', function() {
  // now we can evaluate some feature flags
});

// or:
client.waitForInitialization().then(function() {
  // now we can evaluate some feature flags
});

// or, in async code:
await client.waitForInitialization();
```

If you try to evaluate feature flags before the client is ready, it will behave as it would if no flags existed (i.e. `variation` will return a default value).

Out of the box, initializing the client will make a remote request to LaunchDarkly, so it may take approximately 100 milliseconds before the ready event is emitted. If you require feature flag values immediately, we recommend bootstrapping the client-- see below.

### Bootstrapping

The `bootstrap` property in the client options allows you to speed up the startup process by providing an initial set of flag values.

If you set `bootstrap` to an object, the client will treat it as a map of flag keys to flag values. The client will immediately start out in a ready state using these values. It will _not_ request updated flag values from LaunchDarkly, unless you turn on streaming (see "Receiving live updates").

If you set `bootstrap` to the string `"localstorage"`, the client will try to get flag values from persistent storage, using a unique key that is based on the user properties. If the client finds flag values stored for this user, it uses them and starts up immediately in a ready state-- but also makes a background request to LaunchDarkly to get the latest values, and stores them as soon as it receives them.

### Persistent storage

The client can use persistent storage in two ways: to cache flag values (when `options.bootstrap` is set to `"localstorage"`; see above), and to cache a generated key for an anonymous user (see "Initializing the client"). In both cases, the data is stored in files in a directory called "ldclient-user-cache". This directory is created within the current directory by default; you can specify a different location by setting `options.localStoragePath` to a directory path.

### Feature flags

To evaluate any feature flag for the current user, call `variation`:

```js
var showFeature = client.variation("YOUR_FEATURE_KEY", false);

if (showFeature)  {
  // feature flag is  on
} else {
  // feature flag is off
}
```

The return value of `variation` will always be either one of the variations you defined for your flag in the LaunchDarkly dashboard, or the default value. The default value is the second parameter to `variation` (in this case `false`) and it is what the client will use if it's not possible to evaluate the flag (for instance, if the flag key does not exist, or if something about the definition of the flag is invalid).

You can also fetch all feature flags for the current user:

```js
var flags = client.allFlags();
var showFeature = flags['YOUR_FEATURE_KEY'];
```

This returns a key-value map of all your feature flags. It will contain `null` values for any flags that could not be evaluated.

Note that both of these methods are synchronous. The client always has the last known flag values in memory, so retrieving them does not involve any I/O.

### Changing users

The `identify()` method tells the client to change the current user, and obtain the feature flag values for the new user.

If you provide a callback function, it will be called (with a map of flag keys and values) once the flag values for the new user are available; after that point, `variation()` will be using the new values. You can also use a Promise for the same purpose.

```js
var newUser = { key: 'someone-else', name: 'John' };

client.identify(newUser, function(newFlags) {
  console.log('value of flag for this user is: ' + newFlags["YOUR_FEATURE_KEY"]);
  console.log('this should be the same: ' + client.variation("YOUR_FEATURE_KEY"));
});

// or:
client.identify(newUser).then(function(newFlags) {
  // as above
});

// or, in async code:
var newFlags = await client.identify(newUser);
```

Note that the client always has _one_ current user. The client-side SDKs are not designed for evaluating flags for different users at the same time.

### Analytics events

Evaluating flags, either with `variation()` or with `allFlags()`, produces analytics events which you can observe on your LaunchDarkly Debugger page. Specifying a user with `identify()` (and also the initial user specified in the client constructor) also produces an analytics event, which is how LaunchDarkly receives your user data.

You can also explicitly send an event with any data you like using the `track` function:

```js
client.track('my-custom-event-key', { customProperty: someValue });
```

You can completely disable event sending by setting `sendEvents` to `false` in the client options, but be aware that this means you will not have user data on your LaunchDarkly dashboard.

### Receiving live updates

By default, the client requests feature flag values only once per user (i.e. once at startup time, and then each time you call `identify()`). You can also use a persistent connection to receive flag updates whenever they occur.

Setting `streaming` to `true` in the client options, or calling `client.setStreaming(true)`, turns on this behavior. LaunchDarkly will push new values to the SDK, which will update the current feature flag state in the background, ensuring that `variation()` will always return the latest values.

If you want to be notified when a flag has changed, you can use an event listener for a specific flag:

```js
client.on('change:YOUR_FEATURE_KEY', function(newValue, oldValue) {
  console.log('The flag was ' + oldValue + ' and now it is ' + newValue);
});
```

Or, you can listen for all feature flag changes:

```js
client.on('change', function(allFlagChanges)) {
  Object.keys(allFlagChanges).forEach(function(key) {
    console.log('Flag ' + key + ' is now ' + allFlagChanges[key]);
  });
});
```

Subscribing to `change` events will automatically turn on streaming mode too, unless you have explicitly set `streaming` to `false`.

### Logging

By default, the SDK uses the `winston` package. There are four logging levels: `debug`, `info`, `warn`, and `error`; by default, `debug` and `info` messages are hidden. See the [TypeScript definitions](https://github.com/launchdarkly/js-client/tree/master/packages/ldclient-js-common/typings.d.ts) for `LDLogger`, `LDOptions`, and `createConsoleLogger` for more details.

## Learn more

Check out our [documentation](https://docs.launchdarkly.com) for in-depth instructions on configuring and using LaunchDarkly. You can also head straight to the [complete reference guide for this SDK](https://docs.launchdarkly.com/docs/node-client-sdk-reference). The authoritative description of all properties and methods is in the [TypeScript documentation](https://launchdarkly.github.io/node-client-sdk/).

## Testing
 
We run integration tests for all our SDKs using a centralized test harness. This approach gives us the ability to test for consistency across SDKs, as well as test networking behavior in a long-running application. These tests cover each method in the SDK, and verify that event sending, flag evaluation, stream reconnection, and other aspects of the SDK all behave correctly.

## Contributing

We encourage pull-requests and other contributions from the community. We've also published an [SDK contributor's guide](http://docs.launchdarkly.com/docs/sdk-contributors-guide) that provides a detailed explanation of how our SDKs work. See [CONTRIBUTING](CONTRIBUTING.md) for more developer information about this project.

## About LaunchDarkly
 
* LaunchDarkly is a continuous delivery platform that provides feature flags as a service and allows developers to iterate quickly and safely. We allow you to easily flag your features and manage them from the LaunchDarkly dashboard.  With LaunchDarkly, you can:
    * Roll out a new feature to a subset of your users (like a group of users who opt-in to a beta tester group), gathering feedback and bug reports from real-world use cases.
    * Gradually roll out a feature to an increasing percentage of users, and track the effect that the feature has on key metrics (for instance, how likely is a user to complete a purchase if they have feature A versus feature B?).
    * Turn off a feature that you realize is causing performance problems in production, without needing to re-deploy, or even restart the application with a changed configuration file.
    * Grant access to certain features based on user attributes, like payment plan (eg: users on the ‘gold’ plan get access to more features than users in the ‘silver’ plan). Disable parts of your application to facilitate maintenance, without taking everything offline.
* LaunchDarkly provides feature flag SDKs for a wide variety of languages and technologies. Check out [our documentation](https://docs.launchdarkly.com/docs) for a complete list.
* Explore LaunchDarkly
    * [launchdarkly.com](https://www.launchdarkly.com/ "LaunchDarkly Main Website") for more information
    * [docs.launchdarkly.com](https://docs.launchdarkly.com/  "LaunchDarkly Documentation") for our documentation and SDK reference guides
    * [apidocs.launchdarkly.com](https://apidocs.launchdarkly.com/  "LaunchDarkly API Documentation") for our API documentation
    * [blog.launchdarkly.com](https://blog.launchdarkly.com/  "LaunchDarkly Blog Documentation") for the latest product updates
    * [Feature Flagging Guide](https://github.com/launchdarkly/featureflags/  "Feature Flagging Guide") for best practices and strategies
