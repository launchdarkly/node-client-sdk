# Change log

All notable changes to the LaunchDarkly Client-Side SDK for Node.js will be documented in this file.

## [3.0.1] - 2023-02-15
### Changed:
- Upgrade to `js-sdk-common` version `5.0.2`. This removes usage of optional chaining (`?.`) to allow for use with older transpilers.

## [3.0.0] - 2023-01-12
The latest version of this SDK supports LaunchDarkly's new custom contexts feature. Contexts are an evolution of a previously-existing concept, "users." Contexts let you create targeting rules for feature flags based on a variety of different information, including attributes pertaining to users, organizations, devices, and more. You can even combine contexts to create "multi-contexts." 

This feature is only available to members of LaunchDarkly's Early Access Program (EAP). If you're in the EAP, you can use contexts by updating your SDK to the latest version and, if applicable, updating your Relay Proxy. Outdated SDK versions do not support contexts, and will cause unpredictable flag evaluation behavior.

If you are not in the EAP, only use single contexts of kind "user", or continue to use the user type if available. If you try to create contexts, the context will be sent to LaunchDarkly, but any data not related to the user object will be ignored.

For detailed information about this version, please refer to the list below. For information on how to upgrade from the previous version, please read the [migration guide](https://docs.launchdarkly.com/sdk/client-side/node-js/migration-2-to-3).

### Added:
- The types `LDContext`, `LDSingleKindContext`, and `LDMultiKindContext` define the new "context" model.
- All SDK methods that took an `LDUser` parameter now take an `LDContext`. `LDUser` is now a subset of `LDContext`, so existing code based on users will still work.

### Changed _(breaking changes from 3.x)_:
- There is no longer such a thing as a `secondary` meta-attribute that affects percentage rollouts. If you set an attribute with that name in `LDContext`, it will simply be a custom attribute like any other.
- Evaluations now treat the `anonymous` attribute as a simple boolean, with no distinction between a false state and an undefined state.
- `LDClient.getUser` has been replaced with `LDClient.getContext`.
- `privateAttributeNames` has been replaced with `privateAttributes` in `LDOptions`. Private attributes now allow using attribute references.
- Update the version of typedoc used for documentation generation, and update the documentation generation process.


### Changed (behavioral changes):
- Analytics event data now uses a new JSON schema due to differences between the context model and the old user model.

### Removed:
- Removed all types, fields, and methods that were deprecated as of the most recent 3.x release.
- Removed the `secondary` meta-attribute in `LDUser`.
- The `alias` method no longer exists because alias events are not needed in the new context model.
- The `autoAliasingOptOut` and `inlineUsersInEvents` options no longer exist because they are not relevant in the new context model.

### Deprecated:
- The `LDUser`  object has been deprecated. Support for `LDUser` is maintained to simplify the upgrade process, but it is recommended to use `LDContext` in the shape of either `LDSingleKindContext` or `LDMultiKindContext`.

## [2.2.2] - 2022-12-19
### Fixed:
- Upgraded to `js-sdk-common` version `4.3.3` which fixed this [issue](https://github.com/launchdarkly/js-sdk-common/issues/84): Warning: Accessing non-existent property 'messages' of module exports inside circular dependency

## [2.2.1] - 2022-10-21
### Changed:
- Upgraded to `js-sdk-common` version `4.3.2` which includes implementations of `jitter` and `backoff` for streaming connections. When a connection fails the retry will start at the `streamReconnectDelay` and will double on each unsuccessful consecutive connection attempt (`backoff`) to a max of 30 seconds. The delay will be adjusted from 50%-100% of the calculated delay to prevent many clients from attempting to reconnect at the same time (`jitter`).

## [2.2.0] - 2022-10-18
### Changed:
- Upgrade to `js-sdk-common` `4.3.1` which added support for `Inspectors` that can be used for collecting information for monitoring, analytics, and debugging.

## [2.1.0] - 2022-10-06
### Changed:
- Updated `js-sdk-common` version which removed event de-duplication functionality which was made redundant by support of summary events. This will improve the default event behavior when using experimentation.

- Updated development dependencies to recent versions.

- Updated CI builds to current node LTS versions and dropped build support for node 12.

## [2.0.4] - 2022-04-27
### Changed:
- CI builds now include a cross-platform test suite implemented in https://github.com/launchdarkly/sdk-test-harness. This covers many test cases that are also implemented in unit tests, but may be extended in the future to ensure consistent behavior across SDKs in other areas.

### Fixed:
- The `baseUrl`, `streamUrl`, and `eventsUrl` properties now work properly regardless of whether the URL string has a trailing slash. Previously, a trailing slash would cause request URL paths to have double slashes.

## [2.0.3] - 2022-03-14
### Fixed:
- The `original` dependency (and therefore its transitive dependency `url-parse`) had accidentally been included twice, once as a dependency of `js-eventsource` and then again directly in the SDK's `package.json`. This has been removed so there is no longer any reference to the vulnerable `url-parse` that was meant to be removed in [2.0.2](https://github.com/launchdarkly/node-client-sdk/releases/tag/2.0.2). (Thanks, [AlexHladin](https://github.com/launchdarkly/node-client-sdk/pull/26)!)

## [2.0.2] - 2022-03-10
### Fixed:
- Removed a transitive dependency on the package `url-parse`, which was flagged in [CVE-2022-0686](https://nvd.nist.gov/vuln/detail/CVE-2022-0686).

## [2.0.1] - 2022-02-17
### Fixed:
- If the SDK receives invalid JSON data from a streaming connection (possibly as a result of the connection being cut off), it now uses its regular error-handling logic: the error is emitted as an `error` event or, if there are no `error` event listeners, it is logged. Previously, the error would be thrown as an unhandled exception.

## [2.0.0] - 2022-01-26
This major version release is for updating Node.js compatibility, simplifying the SDK's dependencies, and removing deprecated names.

Except for the dependency changes described below which may require minor changes in your build, and a minor new logging feature, usage of the SDK has not changed in this release. For more details about changes that may be necessary, see the [1.x to 2.0 migration guide](https://docs.launchdarkly.com/sdk/client-side/node-js/migration-1-to-2).

Dropping support for obsolete Node.js versions makes it easier to maintain the SDK and keep its dependencies up to date. See LaunchDarkly's [End of Life Policy](https://launchdarkly.com/policies/end-of-life-policy/) regarding platform version support.

Simplifying dependencies reduces the size of the SDK bundle, as well as reducing potential compatibility problems and vulnerabilities.

### Added:
- Added `basicLogger`, allowing customization of the SDK's default logging behavior without having to use Winston or provide a full `LDLogger` implementation.

### Changed:
- The minimum Node.js version is now 12.0.
- Updated dependencies to newer versions and/or more actively maintained packages.
- In TypeScript, the property `LDEvaluationDetail.reason` now has a type of `LDEvaluationReason | undefined`, which correctly reflects the fact that evaluation reasons may not always be available.

### Fixed:
- If the platform local storage mechanism throws an exception (for instance, if file permissions do not allow the data to be saved), the SDK now correctly catches the exception and logs a message about the failure. It will only log this message once during the lifetime of the SDK client.

### Removed:
- Removed the dependency on [Winston](https://www.npmjs.com/package/winston). You can still tell the SDK to use a Winston logger instance that you have created, just as before, so this change should not affect any applications that are using Winston. But the SDK no longer uses Winston to create a default logger if the application does not specify a logger; instead, it uses the `basicLogger` implementation, which uses the same format as the previous default Winston configuration, so again there should be no visible difference.
- Removed `createConsoleLogger`, which is replaced by the more flexible `basicLogger`.
- Removed the type `NonNullableLDEvaluationReason`, which was a side effect of `LDEvaluationDetail.reason` being incorrectly defined before.
- Removed all types, properties, and functions that were deprecated as of the last 1.x release.

## [1.5.2] - 2021-06-10
### Fixed:
- Events for the [LaunchDarkly debugger](https://docs.launchdarkly.com/home/flags/debugger) are now properly pre-processed to omit private user attributes, as well as enforce only expected top level attributes are sent.
- Events for the [LaunchDarkly debugger](https://docs.launchdarkly.com/home/flags/debugger) now include the index of the variation responsible for the evaluation result.
- Updated transitive dependency on the package `url-parse` due to a [vulnerability warning](https://github.com/advisories/GHSA-9m6j-fcg5-2442).

## [1.5.1] - 2021-04-01
### Fixed:
- The property `LDOptions.inlineUsersInEvents` was not included in the TypeScript definitions.

## [1.5.0] - 2021-01-27
### Added:
- Added the `alias` method. This method can be used to associate two user objects for analytics purposes. When invoked, this method will queue a new alias event to be sent to LaunchDarkly.
- Added the `autoAliasingOptOut` configuration option. This can be used to control the new automatic aliasing behavior of the `identify` method; by passing `autoAliasingOptOut: true`, `identify` will not automatically generate alias events.

### Changed:
- The `identify` method will now automatically generate an alias event when switching from an anonymous to a known user. This event associates the two users for analytics purposes as they most likely represent a single person.

## [1.4.7] - 2021-01-26
### Changed:
- In streaming mode, the SDK now automatically drops and restarts the stream connection if it has received no data from the server within a 5-minute interval. This ensures that if the connection fails in such a way that the SDK cannot detect the failure as an I/O error, it will not hang forever waiting for updates from the phantom connection. The LaunchDarkly streaming service sends a tiny &#34;heartbeat&#34; message at regular intervals less than this timeout, to ensure that the SDK will not drop the connection if it is still usable. This logic exists in most other LaunchDarkly SDKs but was not previously implemented in the Node client-side SDK.

### Fixed:
- In TypeScript, `LDEvaluationDetail.reason` is now correctly defined as being nullable. This value is `null` if `LDOptions.evaluationReasons` is false.

## [1.4.6] - 2020-09-14
### Fixed:
- In streaming mode, when connecting to the Relay Proxy rather than directly to the LaunchDarkly streaming service, if the current user was changed twice within a short time it was possible for the SDK to revert to flag values from the previous user.

## [1.4.5] - 2020-07-02
### Changed:
- The default implementation of logging now uses Winston 3.x rather than Winston 2.x. This does not change the content of the log output, and if you have specified your own custom logger then the SDK still uses that. The only effect is that the SDK no longer has dependencies on Winston 2.x.

### Fixed:
- Fixed a bug that could cause extra delays when receiving a large streaming update. The process will still be blocked for some amount of time as the JSON data is being parsed, which is unavoidable in the current architecture, but this bug made it block for longer than necessary.

## [1.4.4] - 2020-05-13
### Fixed:
- The TypeScript declaration for `track()` was missing the optional `metricValue` parameter.

## [1.4.3] - 2020-05-04
### Fixed:
- Some diagnostic event data was being sent twice, resulting in extra HTTP requests. This did not affect analytics events, so customer data on the dashboard and in data export would still be correct.

## [1.4.2] - 2020-03-18
### Fixed:
- Some users reported an error where the SDK said that the content type of a response was `application/json, application/json; charset=utf8`. It is invalid to have multiple Content-Type values in a response and the LaunchDarkly service does not do this, but an improperly configured proxy/gateway might add such a header. Now the SDK will tolerate a value like this as long as it starts with `application/json`.
- Fixed incorrect usage of `Object.hasOwnProperty` which could have caused an error if a feature flag had `hasOwnProperty` as its flag key.

## [1.4.1] - 2020-03-06
### Fixed:
- At client initialization time, if the initial flag polling request failed, it would cause an unhandled promise rejection unless the application had called `waitForInitialization()` and provided an error handler for the promise that was returned by that method. While that is correct behavior if the application did call `waitForInitialization()` (any promise that might be rejected should have an error handler attached), it is inappropriate if the application did not call `waitForInitialization()` at all-- which is not mandatory, since the application could use events instead, or `waitUntilReady()`, or might simply not care about waiting for initialization. This has been fixed so that no such promise is created until the first time the application calls `waitForInitialization()`; subsequent calls to the same method will return the same promise (since initialization can only happen once).
- A bug in the event emitter made its behavior unpredictable if an event handler called `on` or `off` while handling an event. This has been fixed so that all event handlers that were defined _at the time the event was fired_ will be called; any changes made will not take effect until the next event.

## [1.4.0] - 2020-02-14
Note: if you are using the LaunchDarkly Relay Proxy to forward events, update the Relay to version 5.10.0 or later before updating to this Node client-side SDK version.

### Added:
- The SDK now periodically sends diagnostic data to LaunchDarkly, describing the version and configuration of the SDK, the architecture and version of the runtime platform, and performance statistics. No credentials, hostnames, or other identifiable values are included. This behavior can be disabled with the `diagnosticOptOut` option, or configured with `diagnosticRecordingInterval`.

### Fixed:
- When using secure mode in conjunction with streaming mode, if an application specified a new `hash` parameter while changing the current user with `identify()`, the SDK was not using the new `hash` value when recomputing the stream URL, causing the stream to fail. (Thanks, [andrao](https://github.com/launchdarkly/js-sdk-common/issues/13)!)
- Changed some exact version dependencies to &#34;highest compatible&#34; dependencies, to avoid having modules that are also used by the host application loaded twice by NPM. The dependency on `js-sdk-common` is still an exact version dependency so that each release of `node-client-sdk` has well-defined behavior for that internal code.
- Updated comment on `initialize` to clarify the intended singleton usage pattern.

### Removed:
- Removed an unused transitive dependency on `@babel/polyfill`.

## [1.3.1] - 2020-01-15
### Fixed:
- The SDK now specifies a uniquely identifiable request header when sending events to LaunchDarkly to ensure that events are only processed once, even if the SDK sends them two times due to a failed initial attempt.

## [1.3.0] - 2019-12-16
### Added:
- Configuration property `eventCapacity`: the maximum number of analytics events (not counting evaluation counters) that can be held at once, to prevent the SDK from consuming unexpected amounts of memory in case an application generates events unusually rapidly. In JavaScript code this would not normally be an issue, since the SDK flushes events every two seconds by default, but you may wish to increase this value if you will intentionally be generating a high volume of custom or identify events. The default value is 100.
- `LDClient.version` property reports the SDK version string programmatically.

### Changed:
- The SDK now logs a warning if any configuration property has an inappropriate type, such as `baseUri:3` or `sendEvents:"no"`. For boolean properties, the SDK will still interpret the value in terms of truthiness, which was the previous behavior. For all other types, since there's no such commonly accepted way to coerce the type, it will fall back to the default setting for that property; previously, the behavior was undefined but most such mistakes would have caused the SDK to throw an exception at some later point.
- Removed or updated some development dependencies that were causing vulnerability warnings.

### Deprecated:
- The `samplingInterval` configuration property was deprecated in the code in the previous minor version release, and in the changelog, but the deprecation notice was accidentally omitted from the documentation comments. It is hereby deprecated again.

## [1.2.1] - 2019-11-06
### Fixed:
- A runtime dependency on `typedoc` was mistakenly added in the 1.2.0 release. This has been removed.


## [1.2.0] - 2019-11-05
### Changed:
- Changed the behavior of the warning message that is logged on failing to establish a streaming connection. Rather than the current behavior where the warning message appears upon each failed attempt, it will now only appear on the first failure in each series of attempts. Also, the message has been changed to mention that retries will occur.

### Deprecated:
- The `samplingInterval` configuration property is deprecated and will be removed in a future version. The intended use case for the `samplingInterval` feature was to reduce analytics event network usage in high-traffic applications. This feature is being deprecated in favor of summary counters, which are meant to track all events.


## [1.1.0] - 2019-10-10
### Added:
- Added support for upcoming LaunchDarkly experimentation features. See `LDClient.track()`.
- The `createConsoleLogger()` function now has an optional second parameter for customizing the log prefix.

### Changed:
- Log messages from `createConsoleLogger()` now include the level ("[warn]", "[error]", etc.) and have a prefix of "LD:" by default.


## [1.0.0] - 2019-07-03
### Added:
- The SDK now logs a message at `info` level when the stream connection is started or stopped. It also logs a message at `warn` level if it detects that the stream had to be restarted due to a connection failure.
 
### Fixed:
- The SDK failed to restart a streaming connection if it had already been dropped and restarted before.
This project adheres to [Semantic Versioning](http://semver.org).

## [1.0.0-beta.2] - 2019-04-23
Beta release, feature-complete. Note that the TLS configuration feature, while it is covered to some degree in unit tests, has not been tested against a real server.
