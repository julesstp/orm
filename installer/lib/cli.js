/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true issue:true */

(function () {
  "use strict";
  
  X.debugging = true;
  
  var io = require("socket.io-client"), argv = process.argv, con, credentials = {},
    path;
  
  // if the -cli flag is passed we assume we can find the
  // correct/necessary credentials on the command line as well
  if (argv.indexOf("-cli") > -1) {
    
    path = argv[argv.indexOf("--path") + 1];
    if (path === 'node') {issue(X.fatal("You must provide a relative path of the orms to install with the --path argument"));}
    credentials.hostname = argv[argv.indexOf("-h") + 1];
    credentials.username = argv[argv.indexOf("-u") + 1];
    credentials.port = argv[argv.indexOf("-p") + 1];
    credentials.organization = argv[argv.indexOf("-d") + 1];
    
    // password is the lone exception here
    if (argv.indexOf("-P") > -1) credentials.password = argv[argv.indexOf("-P") + 1];
    else credentials.password = "";
      
    con = io.connect("http://localhost:%@/orm".f(X.options.orm.port));
    con.on("error", function (e) { issue(X.fatal("Error connecting via CLI: %@".f(e))); });
    con.on("message", function (msg) {
      X.debug("server: %@".f(msg));
    });
    con.on("connect", function () {
      var options = { path: path };
      con.emit("select", credentials, function (ok) {
        if (!ok) issue(X.fatal("Could not connect to database"));
        // when the refresh comes back we know its done calculating dependencies
        con.emit("refresh", options, function () {
          con.emit("install", function () {
            // all done
            X.log("completed install");
            process.emit("SIGINT");
          })
        })
      })
    });
  }
}());