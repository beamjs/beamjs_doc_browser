// 
require.paths.unshift(__dirname);
require('showdown');

beamjs.bundles.load("node_compat","erlang","stdlib","commonjs");
var http = require('http');
var global = {
                __doc__: "Below you can find a list of pre-packaged bundles [Beam.js](http://beamjs.org) provides. Please note that you can combine them.\n\n" +
                beamjs.bundles.__doc__ +
                "Once bundles are loaded using one of the above methods, their modules become available to a program. Happy hacking!",
               "default": { __doc__: "This bundle provides core Beam.js functionality and is always loaded", beamjs: beamjs, require: require, console: console },
               "node_compat": { __doc__: "Node.js compatibility layer", events: require('events'), sys: require('sys'), fs: require('fs'), util: require('util') },
               "erlang": { __doc__: "This bundle exposes core Erlang functionality", messaging: require('messaging'), dist: require('dist') },
               "stdlib": { __doc__: "Standard Library", os: require('os') },
               "commonjs": { __doc__: "CommonJS compatibility layer", test: require('test'), assert: require('assert') }
             };


var YAJET = require('yajet');

var Template = function (v) { return v};
var STATIC = {
    '/js/code_highlighter.js': undefined,
    '/js/javascript.js': undefined,
    '/css/main.css': undefined
};

var handler = function(request, response) {	 
    if (request.path == "/favicon.ico") {
        response.writeHead(404,{});
        response.end();
        return;
    }

    if (STATIC[request.path] != undefined) {
        response.writeHead(200,{"Content-Type": "text/css"});
        response.end(STATIC[request.path]);
        return;
    }

    var tokens = request.path.split("/");
    if (request.path=="/") tokens.shift(); // get rid of empty string before the slash

    var current = {"": global};
    var key="", lkey; 
    var path = "";

    while (tokens.length > 0) {
        lkey = tokens.shift();
        if (lkey == "") {
            key += "Bundles";
        } else {
            key += "." + lkey;
        }
        path += lkey + "/" ;
        if ((current = current[lkey]) == undefined) {
            response.writeHead(200,{"Content-Type": "text/html"});
            response.end("<h1>Not found</h1>");
            return;
        }
    }

    var templateData = {
        doc: "",
        key: key,
        topics: {},
        obj: current,
        path: path,
        version: beamjs.version
    };

    if ((d = current['__doc__']) != undefined) {
        templateData.doc= d;
    }

    for (_export in current) {
        if ((_export != "__doc__") && ((typeof current[_export] == 'object') || (typeof current[_export] == 'function'))) {
            templateData.topics[_export] = current[_export];
        }
    }

    if ((typeof current == 'function') && (current.prototype != undefined) && (current.prototype != {})) {
	    templateData.topics['prototype'] = current.prototype;
    }

    try {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end(Template(templateData));
    } catch (e) {
        console.log(e);
    }
};

var showdown = new Showdown.converter();

for (file in STATIC) {
    require('fs').readFile(__dirname + file, function(err, data) {
            STATIC[file] = data;
    });
}

require('fs').readFile(__dirname + "/template.html", function(err, template) {
    Template = new YAJET({reader_char: "$",	filters : {
        showdown: function(val) { return showdown.makeHtml(val) },
        typeOf: function(val) { if (typeof val == 'function') return 'function'; if (typeof val == 'object') return ''; }
    }}).compile(template);
    server = http.createServer(handler)
    server.listen(listenPort || 8080);
});
