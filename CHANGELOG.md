# Change log

All notable changes to the LaunchDarkly Client-Side SDK for Node.js will be documented in this file.

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
