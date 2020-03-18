# Change log

All notable changes to the LaunchDarkly Client-Side SDK for Node.js will be documented in this file.

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
