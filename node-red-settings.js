
module.exports = {
    // The tcp port that the Node-RED web server is listening on
    uiPort: process.env.PORT || 1880,

    // By default, the Node-RED UI accepts connections on all IPv4 interfaces.
    // To accept connections only from the local machine, use 127.0.0.1.
    // To accept connections from remote machines, use 0.0.0.0.
    uiHost: "0.0.0.0",

    // Retry time in milliseconds for MQTT connections
    mqttReconnectTime: 15000,

    // The maximum length, in characters, of any message sent to the debug sidebar tab
    debugMaxLength: 1000,

    // The maximum number of messages nodes will buffer internally as part of their
    // operation. This applies across nodes, not per node.
    nodeMessageBufferMaxLength: 5000,

    // By default, credentials are encrypted in storage using a generated key. To
    // specify your own secret, set the following property.
    //credentialSecret: "a-secret-key",

    // By default, all user data is stored in a directory called `.node-red` under
    // the user's home directory. To use a different location, the following
    // property can be used
    //userDir: '/home/nol/.node-red/',

    // Node-RED scans the `nodes` directory in the userDir to find local node files.
    // The following property can be used to specify an additional directory to scan.
    //nodesDir: '/home/nol/.node-red/nodes',

    // By default, the Node-RED UI is available at http://localhost:1880/
    // The following property can be used to specify a different root path.
    //httpRoot: '/red',

    // When httpAdminRoot is used to move the UI to a different root path, the
    // following property can be used to identify a directory of static content
    // that should be served at http://localhost:1880/.
    //httpStatic: '/home/nol/node-red-static/',

    // The maximum size of HTTP request that will be accepted by the runtime api.
    // Default: 5mb
    //apiMaxLength: '5mb',

    // If you installed the optional node-red-dashboard you can set it's path
    // relative to httpRoot
    //ui: { path: "ui" },

    // Securing Node-RED
    // -----------------
    // To password protect the Node-RED editor and admin API, the following
    // property can be used. See http://nodered.org/docs/security.html for details.
    //adminAuth: {
    //    type: "credentials",
    //    users: [{
    //        username: "admin",
    //        password: "$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN.",
    //        permissions: "*"
    //    }]
    //},

    // To password protect the node-defined HTTP endpoints (httpNodeRoot), or
    // the static content (httpStatic), the following properties can be used.
    // The pass field is a bcrypt hash of the password.
    // See http://nodered.org/docs/security.html#generating-the-password-hash
    //httpNodeAuth: {user:"user",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},
    //httpStaticAuth: {user:"user",pass:"$2a$08$zZWtXTja0fB1pzD4sHCMyOCMYz2Z6dNbM6tl8sJogENOMcxWV9DN."},

    // The following property can be used to enable HTTPS
    // See http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
    // for details on its contents.
    // See the comment at the top of this file on how to load the `fs` module used by
    // this setting.
    //
    //https: {
    //    key: fs.readFileSync('privatekey.pem'),
    //    cert: fs.readFileSync('certificate.pem')
    //},

    // The following property can be used to refresh the context of the flows
    // on a set interval. If set to false or 0, the flows will not be auto-refreshed.
    // Defaults to disabled.
    //contextStorage: {
    //    default: "memoryOnly",
    //    memoryOnly: { module: 'memory' },
    //    file: { module: 'localfilesystem' }
    //},

    // The following property can be used to order the categories in the editor
    // palette. If a node's category is not in the list, the category will get
    // added to the end of the palette.
    // If not set, the following default order is used:
    //paletteCategories: ['subflows', 'common', 'function', 'network', 'sequence', 'parser', 'storage'],

    // Configure the logging output
    logging: {
        // Only console logging is currently supported
        console: {
            // Level of logging to be recorded. Options are:
            // fatal, error, warn, info, debug, trace
            level: "info",
            // Whether or not to include metric events in the log output
            metrics: false,
            // Whether or not to include audit events in the log output
            audit: false
        }
    },

    // Customising the editor
    editorTheme: {
        projects: {
            // To enable the Projects feature, set this value to true
            enabled: false
        }
    }
}
