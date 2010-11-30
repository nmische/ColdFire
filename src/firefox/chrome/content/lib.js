(function() {

/*
    json2.js
    2008-03-14

    Public Domain

    No warranty expressed or implied. Use at your own risk.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods:

        JSON.stringify(value, whitelist)
            value       any JavaScript value, usually an object or array.

            whitelist   an optional array parameter that determines how object
                        values are stringified.

            This method produces a JSON text from a JavaScript value.
            There are three possible ways to stringify an object, depending
            on the optional whitelist parameter.

            If an object has a toJSON method, then the toJSON() method will be
            called. The value returned from the toJSON method will be
            stringified.

            Otherwise, if the optional whitelist parameter is an array, then
            the elements of the array will be used to select members of the
            object for stringification.

            Otherwise, if there is no whitelist parameter, then all of the
            members of the object will be stringified.

            Values that do not have JSON representaions, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays will be replaced with null.
            JSON.stringify(undefined) returns undefined. Dates will be
            stringified as quoted ISO dates.

            Example:

            var text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'

        JSON.parse(text, filter)
            This method parses a JSON text to produce an object or
            array. It can throw a SyntaxError exception.

            The optional filter parameter is a function that can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. If a key contains the string 'date' then
            // convert the value to a date.

            myData = JSON.parse(text, function (key, value) {
                return key.indexOf('date') >= 0 ? new Date(value) : value;
            });

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    Use your own copy. It is extremely unwise to load third party
    code into your pages.
*/

/*jslint evil: true */

/*global JSON */

/*members "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    charCodeAt, floor, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join, length,
    parse, propertyIsEnumerable, prototype, push, replace, stringify, test,
    toJSON, toString
*/

if (!this.JSON) {

    JSON = function () {

        function f(n) {    // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        Date.prototype.toJSON = function () {

// Eventually, this method will be based on the date.toISOString method.

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };


        var m = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

        function stringify(value, whitelist) {
            var a,          // The array holding the partial texts.
                i,          // The loop counter.
                k,          // The member key.
                l,          // Length.
                r = /["\\\x00-\x1f\x7f-\x9f]/g,
                v;          // The member value.

            switch (typeof value) {
            case 'string':

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe sequences.

                return r.test(value) ?
                    '"' + value.replace(r, function (a) {
                        var c = m[a];
                        if (c) {
                            return c;
                        }
                        c = a.charCodeAt();
                        return '\\u00' + Math.floor(c / 16).toString(16) +
                                                   (c % 16).toString(16);
                    }) + '"' :
                    '"' + value + '"';

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':
                return String(value);

            case 'object':

// Due to a specification blunder in ECMAScript,
// typeof null is 'object', so watch out for that case.

                if (!value) {
                    return 'null';
                }

// If the object has a toJSON method, call it, and stringify the result.

                if (typeof value.toJSON === 'function') {
                    return stringify(value.toJSON());
                }
                a = [];
                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length'))) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    l = value.length;
                    for (i = 0; i < l; i += 1) {
                        a.push(stringify(value[i], whitelist) || 'null');
                    }

// Join all of the elements together and wrap them in brackets.

                    return '[' + a.join(',') + ']';
                }
                if (whitelist) {

// If a whitelist (array of keys) is provided, use it to select the components
// of the object.

                    l = whitelist.length;
                    for (i = 0; i < l; i += 1) {
                        k = whitelist[i];
                        if (typeof k === 'string') {
                            v = stringify(value[k], whitelist);
                            if (v) {
                                a.push(stringify(k) + ':' + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (typeof k === 'string') {
                            v = stringify(value[k], whitelist);
                            if (v) {
                                a.push(stringify(k) + ':' + v);
                            }
                        }
                    }
                }

// Join all of the member texts together and wrap them in braces.

                return '{' + a.join(',') + '}';
            }
        }

        return {
            stringify: stringify,
            parse: function (text, filter) {
                var j;

                function walk(k, v) {
                    var i, n;
                    if (v && typeof v === 'object') {
                        for (i in v) {
                            if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                                n = walk(i, v[i]);
                                if (n !== undefined) {
                                    v[i] = n;
                                } else {
                                    delete v[i];
                                }
                            }
                        }
                    }
                    return filter(k, v);
                }


// Parsing happens in three stages. In the first stage, we run the text against
// regular expressions that look for non-JSON patterns. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we want to reject all
// unexpected forms.

// We split the first stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace all backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the second stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

// In the optional third stage, we recursively walk the new structure, passing
// each name/value pair to a filter function for possible transformation.

                    return typeof filter === 'function' ? walk('', j) : j;
                }

// If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('parseJSON');
            }
        };
    }();
}


/*
 * LoggingUtil
 */

function LoggingUtil() {
	this.coldFire = top.ColdFire;
	this.consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);	
}

LoggingUtil.prototype = {
	logMessage: function(msg){
		if (this.coldFire.getPref("logMsgs"))
			this.consoleService.logStringMessage('ColdFire: ' + msg);
	}
}

this.LoggingUtil = LoggingUtil;

// misc helper functions

function $CFSTR(name)
{
	return document.getElementById("strings_coldfire").getString(name);
}

this.$CFSTR = $CFSTR;

function safeParseFloat(val)
{
	return (isNaN(parseFloat(val))) ? 0 : parseFloat(val);
}

this.safeParseFloat = safeParseFloat;

function safeParseInt(val)
{
	return (isNaN(parseInt(val))) ? 0 : parseInt(val);
}

this.safeParseInt = safeParseInt;

function setDebugMode(ColdFusion,debug){	
	
	var $C = ColdFusion;
	var $A = $C.Ajax;
	var $X = $C.AjaxProxy;
	var $B = $C.Bind;
	var $E = $C.Event;
	var $L = $C.Log;
	var $U = $C.Util;
	var $D = $C.DOM;
	var $S = $C.Spry;
	var $P = $C.Pod;
	
	if (debug) {
	
		$A.sendMessage = function(url, _1a, _1b, _1c, _1d, _1e, _1f){
			var req = $A.createXMLHttpRequest();
			if (!_1a) {
				_1a = "GET";
			}
			if (_1c && _1d) {
				req.onreadystatechange = function(){
					$A.callback(req, _1d, _1e);
				};
			}
			if (_1b) {
				_1b += "&_cf_nodebug=false&_cf_nocache=true";
			}
			else {
				_1b = "_cf_nodebug=false&_cf_nocache=true";
			}
			if (window._cf_clientid) {
				_1b += "&_cf_clientid=" + _cf_clientid;
			}
			if (_1a == "GET") {
				if (_1b) {
					_1b += "&_cf_rc=" + ($C.requestCounter++);
					if (url.indexOf("?") == -1) {
						url += "?" + _1b;
					}
					else {
						url += "&" + _1b;
					}
				}
				$L.info("ajax.sendmessage.get", "http", [url]);
				req.open(_1a, url, _1c);
				req.send(null);
			}
			else {
				$L.info("ajax.sendmessage.post", "http", [url, _1b]);
				req.open(_1a, url, _1c);
				req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				if (_1b) {
					req.send(_1b);
				}
				else {
					req.send(null);
				}
			}
			if (!_1c) {
				while (req.readyState != 4) {
				}
				if ($A.isRequestError(req)) {
					$C.handleError(null, "ajax.sendmessage.error", "http", [req.status, req.statusText], req.status, req.statusText, _1f);
				}
				else {
					return req;
				}
			}
		};
		$S.bindHandler = function(_163, _164){
			var url;
			var _166 = "_cf_nodebug=false&_cf_nocache=true";
			if (window._cf_clientid) {
				_166 += "&_cf_clientid=" + _cf_clientid;
			}
			var _167 = window[_164.bindTo];
			var _168 = (typeof(_167) == "undefined");
			if (_164.cfc) {
				var _169 = {};
				var _16a = _164.bindExpr;
				for (var i = 0; i < _16a.length; i++) {
					var _16c;
					if (_16a[i].length == 2) {
						_16c = _16a[i][1];
					}
					else {
						_16c = $B.getBindElementValue(_16a[i][1], _16a[i][2], _16a[i][3], false, _168);
					}
					_169[_16a[i][0]] = _16c;
				}
				_169 = $X.JSON.encode(_169);
				_166 += "&method=" + _164.cfcFunction;
				_166 += "&argumentCollection=" + encodeURIComponent(_169);
				$L.info("spry.bindhandler.loadingcfc", "http", [_164.bindTo, _164.cfc, _164.cfcFunction, _169]);
				url = _164.cfc;
			}
			else {
				url = $B.evaluateBindTemplate(_164, false, true, _168);
				$L.info("spry.bindhandler.loadingurl", "http", [_164.bindTo, url]);
			}
			var _16d = _164.options ||
			{};
			if ((_167 && _167._cf_type == "json") || _164.dsType == "json") {
				_166 += "&returnformat=json";
			}
			if (_167) {
				if (_167.requestInfo.method == "GET") {
					_16d.method = "GET";
					if (url.indexOf("?") == -1) {
						url += "?" + _166;
					}
					else {
						url += "&" + _166;
					}
				}
				else {
					_16d.postData = _166;
					_16d.method = "POST";
					_167.setURL("");
				}
				_167.setURL(url, _16d);
				_167.loadData();
			}
			else {
				if (!_16d.method || _16d.method == "GET") {
					if (url.indexOf("?") == -1) {
						url += "?" + _166;
					}
					else {
						url += "&" + _166;
					}
				}
				else {
					_16d.postData = _166;
					_16d.useCache = false;
				}
				var ds;
				if (_164.dsType == "xml") {
					ds = new Spry.Data.XMLDataSet(url, _164.xpath, _16d);
				}
				else {
					ds = new Spry.Data.JSONDataSet(url, _16d);
					ds.preparseFunc = $S.preparseData;
				}
				ds._cf_type = _164.dsType;
				var _16f = {
					onLoadError: function(req){
						$C.handleError(_164.errorHandler, "spry.bindhandler.error", "http", [_164.bindTo, req.url, req.requestInfo.postData]);
					}
				};
				ds.addObserver(_16f);
				window[_164.bindTo] = ds;
			}
		};
		
	} else {
		
		$A.sendMessage = function(url, _1a, _1b, _1c, _1d, _1e, _1f){
			var req = $A.createXMLHttpRequest();
			if (!_1a) {
				_1a = "GET";
			}
			if (_1c && _1d) {
				req.onreadystatechange = function(){
					$A.callback(req, _1d, _1e);
				};
			}
			if (_1b) {
				_1b += "&_cf_nodebug=true&_cf_nocache=true";
			}
			else {
				_1b = "_cf_nodebug=true&_cf_nocache=true";
			}
			if (window._cf_clientid) {
				_1b += "&_cf_clientid=" + _cf_clientid;
			}
			if (_1a == "GET") {
				if (_1b) {
					_1b += "&_cf_rc=" + ($C.requestCounter++);
					if (url.indexOf("?") == -1) {
						url += "?" + _1b;
					}
					else {
						url += "&" + _1b;
					}
				}
				$L.info("ajax.sendmessage.get", "http", [url]);
				req.open(_1a, url, _1c);
				req.send(null);
			}
			else {
				$L.info("ajax.sendmessage.post", "http", [url, _1b]);
				req.open(_1a, url, _1c);
				req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				if (_1b) {
					req.send(_1b);
				}
				else {
					req.send(null);
				}
			}
			if (!_1c) {
				while (req.readyState != 4) {
				}
				if ($A.isRequestError(req)) {
					$C.handleError(null, "ajax.sendmessage.error", "http", [req.status, req.statusText], req.status, req.statusText, _1f);
				}
				else {
					return req;
				}
			}
		};
		$S.bindHandler = function(_163, _164){
			var url;
			var _166 = "_cf_nodebug=true&_cf_nocache=true";
			if (window._cf_clientid) {
				_166 += "&_cf_clientid=" + _cf_clientid;
			}
			var _167 = window[_164.bindTo];
			var _168 = (typeof(_167) == "undefined");
			if (_164.cfc) {
				var _169 = {};
				var _16a = _164.bindExpr;
				for (var i = 0; i < _16a.length; i++) {
					var _16c;
					if (_16a[i].length == 2) {
						_16c = _16a[i][1];
					}
					else {
						_16c = $B.getBindElementValue(_16a[i][1], _16a[i][2], _16a[i][3], false, _168);
					}
					_169[_16a[i][0]] = _16c;
				}
				_169 = $X.JSON.encode(_169);
				_166 += "&method=" + _164.cfcFunction;
				_166 += "&argumentCollection=" + encodeURIComponent(_169);
				$L.info("spry.bindhandler.loadingcfc", "http", [_164.bindTo, _164.cfc, _164.cfcFunction, _169]);
				url = _164.cfc;
			}
			else {
				url = $B.evaluateBindTemplate(_164, false, true, _168);
				$L.info("spry.bindhandler.loadingurl", "http", [_164.bindTo, url]);
			}
			var _16d = _164.options ||
			{};
			if ((_167 && _167._cf_type == "json") || _164.dsType == "json") {
				_166 += "&returnformat=json";
			}
			if (_167) {
				if (_167.requestInfo.method == "GET") {
					_16d.method = "GET";
					if (url.indexOf("?") == -1) {
						url += "?" + _166;
					}
					else {
						url += "&" + _166;
					}
				}
				else {
					_16d.postData = _166;
					_16d.method = "POST";
					_167.setURL("");
				}
				_167.setURL(url, _16d);
				_167.loadData();
			}
			else {
				if (!_16d.method || _16d.method == "GET") {
					if (url.indexOf("?") == -1) {
						url += "?" + _166;
					}
					else {
						url += "&" + _166;
					}
				}
				else {
					_16d.postData = _166;
					_16d.useCache = false;
				}
				var ds;
				if (_164.dsType == "xml") {
					ds = new Spry.Data.XMLDataSet(url, _164.xpath, _16d);
				}
				else {
					ds = new Spry.Data.JSONDataSet(url, _16d);
					ds.preparseFunc = $S.preparseData;
				}
				ds._cf_type = _164.dsType;
				var _16f = {
					onLoadError: function(req){
						$C.handleError(_164.errorHandler, "spry.bindhandler.error", "http", [_164.bindTo, req.url, req.requestInfo.postData]);
					}
				};
				ds.addObserver(_16f);
				window[_164.bindTo] = ds;
			}
		};
		
	}
	
}

this.setDebugMode = setDebugMode;

}).apply(FBL);