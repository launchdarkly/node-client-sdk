import { checkServerIdentity } from "tls";

/**
 * This is the API reference for the LaunchDarkly Client-Side Node SDK.
 *
 * In typical usage, you will call [[initialize]] in the main process at startup time to obtain an
 * an instance of [[LDClient]].
 *
 * For more information, see the [SDK reference guide](http://docs.launchdarkly.com/docs/node-client-sdk-reference).
 */
declare module 'launchdarkly-node-client-sdk' {

//// DOCBUILD-START-REPLACE  (see docs/Makefile)
  export * from 'ldclient-js-common';

  import {
    LDEvaluationDetail,
    LDEvaluationReason,
    LDFlagSet,
    LDFlagValue,
    LDClientBase,
    LDOptionsBase,
    LDUser
  } from 'ldclient-js-common';
//// DOCBUILD-END-REPLACE

  /**
   * Creates an instance of the LaunchDarkly client to be used in the main process.
   *
   * @param envKey
   *   The LaunchDarkly environment ID.
   * @param user
   *   The initial user properties. These can be changed later with [[LDClient.identify]].
   * @param options
   *   Optional configuration settings.
   */
  export function initialize(envKey: string, user: LDUser, options?: LDOptions): LDClient;

  /**
   * Initialization options for the LaunchDarkly client.
   */
  export interface LDOptions extends LDOptionsBase {
    /**
     * Determines where flag values and anonymous user keys are cached in the filesystem. By
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
   * Additional parameters to pass to the Node HTTPS API for secure requests.  These can include any
   * of the TLS-related parameters supported by `https.request()`, such as `ca`, `cert`, and `key`.
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
    secureProtocol: string;
    servername?: string;
  }

  /**
   * The LaunchDarkly SDK client object.
   *
   * Applications should configure the client at startup time with [[initialize]], and reuse the same instance.
   *
   * For more information, see the [SDK Reference Guide](http://docs.launchdarkly.com/docs/node-client-sdk-reference).
   */
  export interface LDClient extends LDClientBase {
  }
}
