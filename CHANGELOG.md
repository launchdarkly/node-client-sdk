# Change log

All notable changes to the LaunchDarkly Client-Side SDK for Node.js will be documented in this file.

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
