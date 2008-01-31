// Class: Dump
// Author: Shuns (www.netgrow.com.au/files)
// Last Updated: 10/10/06
// Version: 1.1




function ColdFireDump() {} 
ColdFireDump.prototype =
{	
	st: true,
	dump: function(object, showTypes){		
		var dump = '';
  		var obj = eval( '(' + object + ')' );
		this.st = typeof showTypes == 'undefined' ? true : showTypes;
		
  		dump += (/string|number|undefined|boolean/.test(typeof(obj)) || obj == null) ? obj : this.recurse(obj, typeof obj);
  		return dump;
	},
	recurse: function (o, type) {
	    var i;
		var j = 0;
		var r = '';
		type = this.dumpType(o);
		switch (type) {		
		  case 'regexp':
		    var t = type;
		    r += '<table' + this.dumpStyles(t,'table') + '><tr><th colspan="2"' + this.dumpStyles(t,'th') + '>' + t + '</th></tr>';
		    r += '<tr><td colspan="2"' + this.dumpStyles(t,'td-value') + '><table' + this.dumpStyles('arguments','table') + '><tr><td' + this.dumpStyles('arguments','td-key') + '><i>RegExp: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';  
		    j++;
		    break;
		  case 'date':
		    var t = type;
		    r += '<table' + this.dumpStyles(t,'table') + '><tr><th colspan="2"' + this.dumpStyles(t,'th') + '>' + t + '</th></tr>';
		    r += '<tr><td colspan="2"' + this.dumpStyles(t,'td-value') + '><table' + this.dumpStyles('arguments','table') + '><tr><td' + this.dumpStyles('arguments','td-key') + '><i>Date: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';  
		    j++;
		    break;
		  case 'function':
		    var t = type;
		    var a = o.toString().match(/^.*function.*?\((.*?)\)/im); 
		    var args = (a == null || typeof a[1] == 'undefined' || a[1] == '') ? 'none' : a[1];
		    r += '<table' + this.dumpStyles(t,'table') + '><tr><th colspan="2"' + this.dumpStyles(t,'th') + '>' + t + '</th></tr>';
		    r += '<tr><td colspan="2"' + this.dumpStyles(t,'td-value') + '><table' + this.dumpStyles('arguments','table') + '><tr><td' + this.dumpStyles('arguments','td-key') + '><i>Arguments: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + args + '</td></tr><tr><td' + this.dumpStyles('arguments','td-key') + '><i>Function: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + o + '</td></tr></table>';  
		    j++;
		    break;
		  case 'domelement':
		    var t = type;
		    r += '<table' + this.dumpStyles(t,'table') + '><tr><th colspan="2"' + this.dumpStyles(t,'th') + '>' + t + '</th></tr>';
		    r += '<tr><td' + this.dumpStyles(t,'td-key') + '><i>Node Name: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + o.nodeName.toLowerCase() + '</td></tr>';  
			r += '<tr><td' + this.dumpStyles(t,'td-key') + '><i>Node Type: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + o.nodeType + '</td></tr>'; 
			r += '<tr><td' + this.dumpStyles(t,'td-key') + '><i>Node Value: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + o.nodeValue + '</td></tr>'; 					
			r += '<tr><td' + this.dumpStyles(t,'td-key') + '><i>innerHTML: </i></td><td' + this.dumpStyles(type,'td-value') + '>' + o.innerHTML + '</td></tr>';  
		    j++;
		    break;		
		}
		if (/object|array/.test(type)) {
	      for (i in o) {
		    var t = this.dumpType(o[i]);
		    if (j < 1) {
		      r += '<table' + this.dumpStyles(type,'table') + '><tr><th colspan="2"' + this.dumpStyles(type,'th') + '>' + type + '</th></tr>';
			  j++;	  
		    }
		    if (typeof o[i] == 'object' && o[i] != null) { 
			  r += '<tr><td' + this.dumpStyles(type,'td-key') + '>' + i + (this.st ? ' [' + t + ']' : '') + '</td><td' + this.dumpStyles(type,'td-value') + '>' + this.recurse(o[i], t) + '</td></tr>';	
		    } else if (typeof o[i] == 'function') {
			  r += '<tr><td' + this.dumpStyles(type ,'td-key') + '>' + i + (this.st ? ' [' + t + ']' : '') + '</td><td' + this.dumpStyles(type,'td-value') + '>' + this.recurse(o[i], t) + '</td></tr>';  	
			} else {
			  r += '<tr><td' + this.dumpStyles(type,'td-key') + '>' + i + (this.st ? ' [' + t + ']' : '') + '</td><td' + this.dumpStyles(type,'td-value') + '>' + o[i] + '</td></tr>';  
		    }
		  }
		}
		if (j == 0) {
		  r += '<table' + this.dumpStyles(type,'table') + '><tr><th colspan="2"' + this.dumpStyles(type,'th') + '>' + type + ' [empty]</th></tr>'; 	
		}
		r += '</table>';
		return r;
	},	
	dumpStyles: function(type, use) {
		  var r = '';
		  var table = 'font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;cell-spacing:2px;';
		  var th = 'font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;text-align:left;color: white;padding: 5px;vertical-align :top;cursor:hand;cursor:pointer;';
		  var td = 'font-size:xx-small;font-family:verdana,arial,helvetica,sans-serif;vertical-align:top;padding:3px;';
		  var thScript = 'onClick="tTable(this);" title="click to collapse"';
		  var tdScript = 'onClick="tRow(this);" title="click to collapse"';
		  switch (type) {
			case 'string':
			case 'number':
			case 'boolean':
			case 'undefined':
			case 'object':
			  switch (use) {
				case 'table':  
				  r = ' style="' + table + 'background-color:#0000cc;"';
				  break;
				case 'th':
				  r = ' style="' + th + 'background-color:#4444cc;"' + thScript;
				  break;
				case 'td-key':
				  r = ' style="' + td + 'background-color:#ccddff;cursor:hand;cursor:pointer;"' + tdScript;
				  break;
				case 'td-value':
				  r = ' style="' + td + 'background-color:#fff;"';
				  break;
			  }
			  break;
			case 'array':
			  switch (use) {
				case 'table':  
				  r = ' style="' + table + 'background-color:#006600;"';
				  break;
				case 'th':
				  r = ' style="' + th + 'background-color:#009900;"' + thScript;
				  break;
				case 'td-key':
				  r = ' style="' + td + 'background-color:#ccffcc;cursor:hand;cursor:pointer;"' + tdScript;
				  break;
				case 'td-value':
				  r = ' style="' + td + 'background-color:#fff;"';
				  break;
			  }	
			  break;
			case 'function':
			  switch (use) {
				case 'table':  
				  r = ' style="' + table + 'background-color:#aa4400;"';
				  break;
				case 'th':
				  r = ' style="' + th + 'background-color:#cc6600;"' + thScript;
				  break;
				case 'td-key':
				  r = ' style="' + td + 'background-color:#fff;cursor:hand;cursor:pointer;"' + tdScript;
				  break;
				case 'td-value':
				  r = ' style="' + td + 'background-color:#fff;"';
				  break;
			  }	
			  break;
			case 'arguments':
			  switch (use) {
				case 'table':  
				  r = ' style="' + table + 'background-color:#dddddd;cell-spacing:3;"';
				  break;
				case 'td-key':
				  r = ' style="' + th + 'background-color:#eeeeee;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
				  break;	  
			  }	
			  break;
			case 'regexp':
			  switch (use) {
				case 'table':  
				  r = ' style="' + table + 'background-color:#CC0000;cell-spacing:3;"';
				  break;
				case 'th':
				  r = ' style="' + th + 'background-color:#FF0000;"' + thScript;
				  break;
				case 'td-key':
				  r = ' style="' + th + 'background-color:#FF5757;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
				  break;
				case 'td-value':
				  r = ' style="' + td + 'background-color:#fff;"';
				  break;		  
			  }	
			  break;
			case 'date':
			  switch (use) {
				case 'table':  
				  r = ' style="' + table + 'background-color:#663399;cell-spacing:3;"';
				  break;
				case 'th':
				  r = ' style="' + th + 'background-color:#9966CC;"' + thScript;
				  break;
				case 'td-key':
				  r = ' style="' + th + 'background-color:#B266FF;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
				  break;
				case 'td-value':
				  r = ' style="' + td + 'background-color:#fff;"';
				  break;		  
			  }	
			  break;
			case 'domelement':
			  switch (use) {
				case 'table':  
				  r = ' style="' + table + 'background-color:#FFCC33;cell-spacing:3;"';
				  break;
				case 'th':
				  r = ' style="' + th + 'background-color:#FFD966;"' + thScript;
				  break;
				case 'td-key':
				  r = ' style="' + th + 'background-color:#FFF2CC;color:#000000;cursor:hand;cursor:pointer;"' + tdScript;
				  break;
				case 'td-value':
				  r = ' style="' + td + 'background-color:#fff;"';
				  break;		  
			  }	
			  break;	  
		  }
		  return r;
	},
	dumpType: function (obj) {
		  var t = typeof(obj);
		  if (t == 'function') {
		    var f = obj.toString();
		    if ( ( /^\/.*\/[gi]??[gi]??$/ ).test(f)) {
		      return 'regexp';
		    } else if ((/^\[object.*\]$/i ).test(f)) {
		      t = 'object'
		    }
		  }
		  if (t != 'object') {
		    return t;
		  }
		  switch (obj) {
		    case null:
		      return 'null';
		    case window:
		      return 'window';
			case document:
			  return document;
		    case window.event:
		      return 'event';
		  }
		  if (window.event && (event.type == obj.type)) {
		    return 'event';
		  }
		  var c = obj.constructor;
		  if (c != null) {
		    switch(c) {
		      case Array:
		        t = 'array';
		        break;
		      case Date:
		        return 'date';
		      case RegExp:
		        return 'regexp';
		      case Object:
		        t = 'object';	
		      break;
		      case ReferenceError:
		        return 'error';
		      default:
		        var sc = c.toString();
		        var m = sc.match(/\s*function (.*)\(/);
		        if(m != null) {
		          return 'object';
		        }
		    }
		  }
		  var nt = obj.nodeType;
		  if (nt != null) {
		    switch(nt) {
		      case 1:
		        if(obj.item == null) {
		          return 'domelement';
		        }
		        break;
		      case 3:
		        return 'string';
		    }
		  }
		  if (obj.toString != null) {
		    var ex = obj.toString();
		    var am = ex.match(/^\[object (.*)\]$/i);
		    if(am != null) {
		      var am = am[1];
		      switch(am.toLowerCase()) {
		        case 'event':
		          return 'event';
		        case 'nodelist':
		        case 'htmlcollection':
		        case 'elementarray':
		          return 'array';
		        case 'htmldocument':
		          return 'htmldocument';
		      }
		    }
		  }
		  return t;
	}
};

	





