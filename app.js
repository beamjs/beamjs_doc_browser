var http = require('http');
var global = { events: require('events'),
               require: require,
               console: console,
               sys: require('sys'),
               messaging: require('messaging'),
               dist: require('dist')
             };

require.paths.unshift(__dirname);
require('showdown');
var _showdown = new Showdown.converter();
var handler = function(request, response) {	 
	if (request.path == "/favicon.ico") {
		response.writeHead(404,{});
		return;
	} 
	
	var tokens = request.path.split("/");
    tokens.shift();

	var moduleName = tokens.shift();
	if (moduleName == "") {
		moduleName = "";
		module = global;
	} else {
		var module = global[moduleName];
		if (module == undefined) {
		 	response.writeHead(200,{"Content-Type": "text/html"});
		 	response.end("<h1>Module not found</h1>");
		    return;
		}
    }

    var current = module;
    var key = moduleName;
	var lkey = moduleName;
    while (tokens.length > 0) {
	  lkey = tokens.shift();
	  key += "." + lkey;
	  if ((current = current[lkey]) == undefined) {
		 response.writeHead(200,{"Content-Type": "text/html"});
		 response.end("<h1>Export not found</h1>");
		 return;
 	  }
    }

	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<html><head><title>Beam.js Documentation Browser</title></head><body>");

	var __doc__ = "";
	
	if ((d = current['__doc__']) != undefined) {
		   __doc__ = _showdown.makeHtml(d);
	}

	
	if (key!="") {
		response.write("<h1><em>" + typeof current + "</em> " + key + "</h1>");
	}
	
	response.write(__doc__);
	
	for (_export in current) {
		if ((_export != "__doc__") && ((typeof current[_export] == 'object') || (typeof current[_export] == 'function')))
		 {
			vkey = lkey;
			if (lkey != "") {
				vkey = "/" + lkey;
			}
			response.write("<h2><em>" + typeof current[_export] + '</em> <a href="' + lkey + '/' + _export +'">' + _export + "</a></h2>");
			__doc__ = ""
			if ((d = current[_export]['__doc__']) != undefined) {
			   	__doc__ = _showdown.makeHtml(d);
			}
			response.write(__doc__);
			response.write('<hr />');
		}
	}
	
	response.write('Powered by <a href="https://github.com/beamjs/beamjs_doc_browser">Beam.js Documentation Browser</a> (<em>Beam.js '+ global.sys.beamjs.version + "</em>)");
	
	response.end("</body></html>");
	
};
http.createServer(handler).listen(listenPort);
