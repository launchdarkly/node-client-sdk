declare module 'launchdarkly-node-client-sdk' {

//// DOCBUILD-START-REPLACE  (see docs/Makefile)
  export * from 'launchdarkly-js-sdk-common';

  import {
    BasicLoggerOptions,
    LDEvaluationDetail,
    LDEvaluationReason,
    LDFlagSet,
    LDFlagValue,
    LDClientBase,
    LDLogger,
    LDOptionsBase,
    LDContext
  } from 'launchdarkly-js-sdk-common';
//// DOCBUILD-END-REPLACE

  /**
   * The current version string of the SDK.
   */
  export const version: string;

  /**
   * Creates an instance of the LaunchDarkly client.
   *
   * Applications should instantiate a single instance for the lifetime of the application.
   * The client will begin attempting to connect to LaunchDarkly as soon as it is created. To
   * determine when it is ready to use, call [[LDClient.waitForInitialization]], or register an
   * event listener for the `"ready"` event using [[LDClient.on]].
   *
   * @param envKey
   *   The LaunchDarkly environment ID.
   * @param context
   *   The initial context properties. These can be changed later with [[LDClient.identify]].
   *   The context must have a `key` property, except that if you omit `context.key` and set `context.anonymous` to
   *   true, the SDK will create a randomized unique key (which will be cached in local storage for the
   *   current OS user account, so the next initialization will reuse the same key).
   * @param options
   *   Optional configuration settings.
   */
  export function initialize(envKey: string, context: LDContext, options?: LDOptions): LDClient;

  /**
   * Initialization options for the LaunchDarkly client.
   */
  export interface LDOptions extends LDOptionsBase {
    /**
     * Determines where flag values and anonymous context keys are cached in the filesystem. By
     * default, this is the current directory.
     */
    localStoragePath?: string;

    /**
     * Additional parameters to pass to the Node HTTPS API for secure requests. These can include any
     * of the TLS-related parameters supported by `https.request()`, such as `ca`, `cert`, and `key`.
     */
    tlsParams?: LDTLSOptions;
  }

  /**
   * Additional parameters to pass to the Node HTTPS API for secure requests. These can include any
   * of the TLS-related parameters supported by `https.request()`, such as `ca`, `cert`, and `key`.
   * This object should be stored in the `tlsParams` property of [[LDOptions]].
   * 
   * For more information, see the Node documentation for `https.request()` and `tls.connect()`.
   */
  export interface LDTLSOptions {
    ca?: string | string[] | Buffer | Buffer[];
    cert?: string | string[] | Buffer | Buffer[];
    checkServerIdentity?: (servername: string, cert: any) => Error | undefined;
    ciphers?: string;
    pfx?: string | string[] | Buffer | Buffer[] | object[];
    key?: string | string[] | Buffer | Buffer[] | object[];
    passphrase?: string;
    rejectUnauthorized?: boolean;
    secureProtocol?: string;
    servername?: string;
  }

  /**
   * The LaunchDarkly SDK client object.
   *
   * Applications should configure the client at startup time with [[initialize]], and reuse the same instance.
   *
   * For more information, see the [SDK Reference Guide](https://docs.launchdarkly.com/sdk/client-side/node-js).
   */
  export interface LDClient extends LDClientBase {
  }

  /**
   * Provides a simple [[LDLogger]] implementation.
   *
   * This logging implementation uses a simple format that includes only the log level
   * and the message text. Output is written to the standard error stream (`console.error`).
   * You can filter by log level as described in [[BasicLoggerOptions.level]].
   *
   * To use the logger created by this function, put it into [[LDOptions.logger]]. If
   * you do not set [[LDOptions.logger]] to anything, the SDK uses a default logger
   * that is equivalent to `ld.basicLogger({ level: 'info' })`.
   *
   * @param options Configuration for the logger. If no options are specified, the
   *   logger uses `{ level: 'info' }`.
   * 
   * @example
   * This example shows how to use `basicLogger` in your SDK options to enable console
   * logging only at `warn` and `error` levels.
   * ```javascript
   *   const ldOptions = {
   *     logger: ld.basicLogger({ level: 'warn' }),
   *   };
   * ```
   *
   * @example
   * This example shows how to use `basicLogger` in your SDK options to cause log
   * output to go to `console.log` instead of `console.error`.
   * ```javascript
   *   const ldOptions = {
   *     logger: ld.basicLogger({ destination: console.log }),
   *   };
   * ```
   */
   export function basicLogger(
    options?: BasicLoggerOptions
  ): LDLogger;
}
