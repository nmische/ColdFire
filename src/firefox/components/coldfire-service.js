/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Nathan Mische.
 *
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Nathan Mische <nmische@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


/* This code is inspired and adapted from:
 * http://modifyheaders.mozdev.org/
 * http://www.firephp.org/  */

const nsIColdFire = Components.interfaces.nsIColdFire;
const nsISupports = Components.interfaces.nsISupports;

/*
 * ColdFire Service
 */

function ColdFireService() {	  
  this.aRequestHeaderEnabled = false;
  this.aExtensionVersion = false;  
  this.aVariables = new Array();
  // Observer service is used to notify observing ColdFireProxy objects that the headers have been updated
  // this.observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
}

ColdFireService.prototype = {
	
	get requestHeaderEnabled() { 
		return this.aRequestHeaderEnabled 
	},
	
	set requestHeaderEnabled(requestHeaderEnabled) { 
		this.aRequestHeaderEnabled = requestHeaderEnabled 
	},
	
	get extensionVersion() { 
		return this.aExtensionVersion 
	},
	
	set extensionVersion(extensionVersion) { 
		this.aExtensionVersion = extensionVersion 
	},
	
	addVariable: function(variable) {
		this.aVariables.push(variable);
	},
	
	removeVariable: function(index){
		this.aVariables.splice(index,1);
	},
	
	getVariables: function(count){
		count.value = this.aVariables.length;
		return this.aVariables;		
	},
	
	clearVariables: function(){
		this.aVariables.length = 0;		
	},
	
	// nsISupports interface method
	QueryInterface: function(iid) {
    	if (!iid.equals(nsIColdFire) && !iid.equals(nsISupports)) {
        	throw Components.results.NS_ERROR_NO_INTERFACE;
    	}
    	return this;
	}
}

/*
 * ColdFire Proxy
 */

function ColdFireProxy() {    
	this.ColdFireService = Components.classes[ColdFireModule.serviceContractID].getService(nsIColdFire);
}

ColdFireProxy.prototype = {

	// nsIObserver interface method
	observe: function(subject, topic, data) {
       	if (topic == 'http-on-modify-request') {
        
        	subject.QueryInterface(Components.interfaces.nsIHttpChannel);
        
        	if(this.ColdFireService.requestHeaderEnabled) {
          		subject.setRequestHeader("User-Agent", 
          			subject.getRequestHeader("User-Agent") + " " + "ColdFire/"+this.ColdFireService.extensionVersion,
					true);
		  
		  		var vars = this.ColdFireService.getVariables({});
		  
		 		if(vars.length)
		  			subject.setRequestHeader("ColdFire-Variables", vars.toJSONString(), true);					 
		   	}
    	} else if (topic == 'app-startup') {        
      		if ("nsINetModuleMgr" in Components.interfaces) {
          		// Should be an old version of Mozilla (before september 15, 2003
          		// Do Nothing as these old versions of firefox (firebird, phoenix etc) are not supported
      		} else {
       			// Should be a new version of  Mozilla (after september 15, 2003)
        		var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        		observerService.addObserver(this, "http-on-modify-request", false);
      		}
    	} else {
       		// No observable topic defined
    	}    
	}
	
}

/* ColdFireModule is responsible for the registration of the component */
var ColdFireModule = {
	
	proxyCID: Components.ID("{57cf94b4-2449-11dc-8314-0800200c9a66}"),
    proxyName: "ColdFire Proxy",
    proxyContractID: "@coldfire.riaforge.org/proxy;1",

    serviceCID: Components.ID("{57cf94b5-2449-11dc-8314-0800200c9a66}"),
    serviceName: "ColdFire Service",
    serviceContractID: "@coldfire.riaforge.org/service;1",
    
    firstTime: true,
	
	// Register the component with the browser
	registerSelf: function (compMgr, fileSpec, location, type) {
    	
		if (this.firstTime) {
        	this.firstTime = false;
       	 	throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
    	}

    	var compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);

    	// Register the objects with the component manager
        compMgr.registerFactoryLocation(this.proxyCID, this.proxyName, this.proxyContractID, fileSpec, location, type)
        compMgr.registerFactoryLocation(this.serviceCID, this.serviceName, this.serviceContractID, fileSpec, location, type)
        
    	var catman = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager)
        catman.addCategoryEntry("app-startup", this.proxyName, this.proxyContractID, true, true);
                            
	},
	
	// Removes the component from the app-startup category
    unregisterSelf: function(compMgr, fileSpec, location) {
        
		var catman = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
        catMan.deleteCategoryEntry("app-startup", this.proxyContractID, true);
    
	},
	
	// Return the Factory object
    getClassObject: function (compMgr, cid, iid) {
        
		if (!iid.equals(Components.interfaces.nsIFactory))
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED
        
        // Check that the component ID is the Modifyheaders Proxy
        if (cid.equals(this.proxyCID) || cid.equals(this.serviceCID)) {
        	return this.factory
        }
		    
        throw Components.results.NS_ERROR_NO_INTERFACE;
    },
	
	factory: {
        createInstance: function (outer, iid) {
           
            if (outer != null)
                throw Components.results.NS_ERROR_NO_AGGREGATION
            
            if (iid.equals(Components.interfaces.nsIObserver)) {
                return new ColdFireProxy()
            } else if (iid.equals(Components.interfaces.nsIColdFire)) {
                return new ColdFireService()
            } 
            
            throw Components.results.NS_ERROR_NO_INTERFACE
        }
    },
	
	canUnload: function(compMgr) {
        return true
    }
	
}

/* Entrypoint - registers the component with the browser */
function NSGetModule(compMgr, fileSpec) {
    return ColdFireModule;
}

/* A logger
var gConsoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

function coldfire_logMessage(aMessage) {
  gConsoleService.logStringMessage('ColdFire Service: ' + aMessage);
}
*/

/*
    json.js
    2007-07-19

    Public Domain

    This file adds these methods to JavaScript:

        array.toJSONString()
        boolean.toJSONString()
        date.toJSONString()
        number.toJSONString()
        object.toJSONString()
        string.toJSONString()
            These methods produce a JSON text from a JavaScript value.
            It must not contain any cyclical references. Illegal values
            will be excluded.

            The default conversion for dates is to an ISO string. You can
            add a toJSONString method to any date object to get a different
            representation.

        string.parseJSON(filter)
            This method parses a JSON text to produce an object or
            array. It can throw a SyntaxError exception.

            The optional filter parameter is a function which can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. If a key contains the string 'date' then
            // convert the value to a date.

            myData = text.parseJSON(function (key, value) {
                return key.indexOf('date') >= 0 ? new Date(value) : value;
            });

    It is expected that these methods will formally become part of the
    JavaScript Programming Language in the Fourth Edition of the
    ECMAScript standard in 2008.

    This file will break programs with improper for..in loops. See
    http://yuiblog.com/blog/2006/09/26/for-in-intrigue/

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    Use your own copy. It is extremely unwise to load untrusted third party
    code into your pages.
*/

/*jslint evil: true */

// Augment the basic prototypes if they have not already been augmented.

if (!Object.prototype.toJSONString) {

    Array.prototype.toJSONString = function () {
        var a = [],     // The array holding the partial texts.
            i,          // Loop counter.
            l = this.length,
            v;          // The value to be stringified.


// For each value in this array...

        for (i = 0; i < l; i += 1) {
            v = this[i];
            switch (typeof v) {
            case 'object':

// Serialize a JavaScript object value. Ignore objects thats lack the
// toJSONString method. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                if (v) {
                    if (typeof v.toJSONString === 'function') {
                        a.push(v.toJSONString());
                    }
                } else {
                    a.push('null');
                }
                break;

            case 'string':
            case 'number':
            case 'boolean':
                a.push(v.toJSONString());

// Values without a JSON representation are ignored.

            }
        }

// Join all of the member texts together and wrap them in brackets.

        return '[' + a.join(',') + ']';
    };


    Boolean.prototype.toJSONString = function () {
        return String(this);
    };


    Date.prototype.toJSONString = function () {

// Eventually, this method will be based on the date.toISOString method.

        function f(n) {

// Format integers to have at least two digits.

            return n < 10 ? '0' + n : n;
        }

        return '"' + this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z"';
    };


    Number.prototype.toJSONString = function () {

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(this) ? String(this) : 'null';
    };


    Object.prototype.toJSONString = function () {
        var a = [],     // The array holding the partial texts.
            k,          // The current key.
            v;          // The current value.

// Iterate through all of the keys in the object, ignoring the proto chain
// and keys that are not strings.

        for (k in this) {
            if (typeof k === 'string' && this.hasOwnProperty(k)) {
                v = this[k];
                switch (typeof v) {
                case 'object':

// Serialize a JavaScript object value. Ignore objects that lack the
// toJSONString method. Due to a specification error in ECMAScript,
// typeof null is 'object', so watch out for that case.

                    if (v) {
                        if (typeof v.toJSONString === 'function') {
                            a.push(k.toJSONString() + ':' + v.toJSONString());
                        }
                    } else {
                        a.push(k.toJSONString() + ':null');
                    }
                    break;

                case 'string':
                case 'number':
                case 'boolean':
                    a.push(k.toJSONString() + ':' + v.toJSONString());

// Values without a JSON representation are ignored.

                }
            }
        }

// Join all of the member texts together and wrap them in braces.

        return '{' + a.join(',') + '}';
    };


    (function (s) {

// Augment String.prototype. We do this in an immediate anonymous function to
// avoid defining global variables.

// m is a table of character substitutions.

        var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };


        s.parseJSON = function (filter) {
            var j;

            function walk(k, v) {
                var i;
                if (v && typeof v === 'object') {
                    for (i in v) {
                        if (v.hasOwnProperty(i)) {
                            v[i] = walk(i, v[i]);
                        }
                    }
                }
                return filter(k, v);
            }


// Parsing happens in three stages. In the first stage, we run the text against
// a regular expression which looks for non-JSON characters. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we will reject all
// unexpected characters.

// We split the first stage into 3 regexp operations in order to work around
// crippling deficiencies in Safari's regexp engine. First we replace all
// backslash pairs with '@' (a non-JSON character). Second we delete all of
// the string literals. Third, we look to see if only JSON characters
// remain. If so, then the text is safe for eval.

            if (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]+$/.test(this.
                    replace(/\\./g, '@').
                    replace(/"[^"\\\n\r]*"/g, ''))) {

// In the second stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + this + ')');

// In the optional third stage, we recursively walk the new structure, passing
// each name/value pair to a filter function for possible transformation.

                return typeof filter === 'function' ? walk('', j) : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('parseJSON');
        };


        s.toJSONString = function () {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can simply slap some quotes around it.
// Otherwise we must also replace the offending characters with safe
// sequences.

            if (/["\\\x00-\x1f]/.test(this)) {
                return '"' + this.replace(/([\x00-\x1f\\"])/g, function (a, b) {
                    var c = m[b];
                    if (c) {
                        return c;
                    }
                    c = b.charCodeAt();
                    return '\\u00' +
                        Math.floor(c / 16).toString(16) +
                        (c % 16).toString(16);
                }) + '"';
            }
            return '"' + this + '"';
        };
    })(String.prototype);
}

