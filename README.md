This package contains the **authzd** Zingle authentication daemon.  This server
can be used to authenticate users and generate and manage JSON Web Tokens.

AuthZ Daemon
============

Environment Variables
---------------------
This section describes the environment variables recognized by the **authzd**
daemon.

#### ISS
JWT issuer.  The current host name will be used as the default.

#### GOOGLE_CALLBACK_URL
URL to return to after successful authentication using Google OAuth.  This
should match the URL of the authz daemon server, but the path set to
"/google/token".  The Google OAuth application must be configured to allow this
callback URL.

#### GOOGLE_CLIENT_ID
The Google OAuth application client ID.

#### GOOGLE_CLIENT_SECRET
The Google OAuth application client secret.

#### LISTEN_PORT
TCP port to listen on for incoming connections.  If a TLS certificate is
configured, the default port is **443**; otherwise, the default port is **80**.

#### SECRET
Application shared secret used to sign and decrypt JWTs.

#### TLS_CERT
Path to TLS certificate in PFX format.  If not set, TLS will not be enabled.

***IMPORTANT!!!*** TLS is required for this service to operate securely; if not
enabled in **authzd**, a proxy such as nginx can be used to terminate TLS.
