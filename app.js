var http = require('http');
var global = { events: require('events'),
               require: require,
               console: console,
               sys: require('sys'),
               messaging: require('messaging'),
               dist: require('dist'),
               fs: require('fs')
             };

require.paths.unshift(__dirname);
require('showdown');

var YAJET = require('yajet');

var Template = function (v) { return v};
var STATIC = {
	'/css/screen.css': undefined,
	'/css/ie.css': undefined,
	'/css/print.css': undefined
};

var handler = function(request, response) {	 
	if (request.path == "/favicon.ico") {
		response.writeHead(404,{});
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
	    key += "(global)";
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
	    path: path,
	    version: global.sys.beamjs.version
    };

	if ((d = current['__doc__']) != undefined) {
		   templateData.doc= d;
	}
	
	for (_export in current) {
		if ((_export != "__doc__") && ((typeof current[_export] == 'object') || (typeof current[_export] == 'function')))
		 {
			templateData.topics[_export] = current[_export];
		}
	}
	
	try {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.end(Template(templateData));
	} catch (e) {
		console.log(e);
	}
};
var showdown = new Showdown.converter();
for (file in STATIC)
require('fs').readFile(__dirname + file, function(err, data) {
	STATIC[file] = data;
});

require('fs').readFile(__dirname + "/template.html", function(err, template) {
	Template = new YAJET({reader_char: "$",	filters : {
        showdown: function(val) { return showdown.makeHtml(val) }
    }}).compile(template);
 	http.createServer(handler).listen(listenPort);
});
