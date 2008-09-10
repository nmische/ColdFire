var FirebugLib = FBL;

with (FirebugLib) {	
	
(function() {	
	
	function defineTags()
	{
	    for (var i = 0; i < arguments.length; ++i)
	    {
	        var tagName = arguments[i];
	        var fn = new Function("var newTag = new DomplateTag('"+tagName+"'); return newTag.merge(arguments);");
	
	        var fnName = tagName.toUpperCase();
	        FBL[fnName] = fn;
	    }
	}

	defineTags("code","i");	
	
	function ColdFireFormatter() {};
	
	ColdFireFormatter.prototype = domplate({
		
		dump:
			TAG('$value|format',{value:'$value|parseParts'}),
				
		arrayTable:
			TABLE({class:'cfdump_array'},
				TBODY(
					TR(
						TH({class:'array',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'array')
					),				
					FOR('x','$value',
						TR(
							TD({class:'array',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
							TD(
								TAG('$x.val|format',{value:'$x.val|parseParts'})
							)							
						)
					)
				)						
			),
					
		binaryTable:
			TABLE({class:'cfdump_binary'},
				TBODY(
					TR(
						TH({class:'binary',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'binary')
					),
					TR(
						TD({class:'binary'},
							CODE('$value.data')
						)
					)
				)			
			),
				
		customfunctionTable:
			TABLE({class:'cfdump_udf', width:'100%'},
				TBODY(
					TR(
						TH({class:'udf',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'function $value.NAME')
					),
					TR(
						TD(
							TABLE({class:'cfdump_udfbody'},
								TBODY(
									TAG('$value|formatUDFArguments',{value:'$value'}),
									TR(
										TD({width:"30%"},I('ReturnType:')),
										TD('$value|formatUDFReturnType')								
									),
									TR(
										TD(I('Roles:')),
										TD('$value|formatUDFRoles')								
									),
									TR(
										TD(I('Access:')),
										TD('$value|formatUDFAccess')								
									),
									TR(
										TD(I('Output:')),
										TD('$value|formatUDFOutput')								
									),
									TR(
										TD(I('DisplayName:')),
										TD('$value|formatUDFDisplayName')								
									),
									TR(
										TD(I('Hint:')),
										TD('$value|formatUDFHint')								
									),
									TR(
										TD(I('Description:')),
										TD('$value|formatUDFDescription')								
								)
								)
							)
						)
					)
				)				
			),
		
		argumentsTable:
			TR(
				TD({colspan:2},
					I('Arguments:'),
					TABLE({class:'cfdump_udfarguments'},
						TBODY(
							TR(
								TH('Name'),
								TH('Required'),
								TH('Type'),
								TH('Default')											
							),
							FOR('param','$value.PARAMETERS',
								TR(
									TD('$param|formatParamName'),
									TD('$param|formatParamRequired'),
									TD('$param|formatParamType'),
									TD('$param|formatParamDefault')
								)											
							)	
						)									
					)									
				)
			),
		
		argumentsRow:
			TR(
				TD(I('Arguments:')),
				TD('none')								
			),
			
		componentTable:
			TABLE({class: 'cfdump_cfc'},
				TBODY(
					TR(
						TH({class:'cfc',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'component $value.NAME')
					),
					TR(				
						TD({class:'cfc',onclick:'$cfdumpToggleRow',style:'cursor:pointer;background-color:#FF99AA;font-style:normal;',title:'click to collapse'},'METHODS'),
						TD({style:'display:block',valign:'top'},
							TABLE({class:'cfdump_cfc'},
								TBODY(
									FOR('func','$value.FUNCTIONS',
										TR({valign:'top'},
											TD({class:'cfc',onclick:'$cfdumpToggleRow',style:'cursor:pointer;background-color:#FF99AA;font-style:normal;',title:'click to collapse'},'$func.NAME'),
											TD(TAG('$this.customfunctionTable',{value:'$func'}))								
										)							
									)	
								)					
							)					
						)					
					)
				)
			),
			
		objectTable:
			TABLE({class: 'cfdump_object'},
				TBODY(
					TR(
						TH({class:'object',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'object of $value.CLASSNAME')
					),
					TR(				
						TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'Class Name'),
						TD('$value.CLASSNAME')					
					),
					TR(				
						TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'Methods'),
						TD(
							TABLE({class:'cfdump_object'},
								TBODY(
									TR(
										TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Method'),
										TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Return Type')
									),
									FOR('meth','$value.METHODS',
										TR({valign:'top'},
											TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$meth.METHOD'),
											TD('$meth.RETURNTYPE')								
										)							
									)
								)					
							)					
						)
					),
					TR(				
						TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'Fields'),
						TD(
							TABLE({class:'cfdump_object'},
								TBODY(
									TR(
										TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Field'),
										TH({class:'object',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'Value')
									),
									FOR('field','$value.FIELDS',
										TR({valign:'top'},
											TD({class:'object',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$field.FIELD'),
											TD('$field.VALUE')								
										)							
									)	
								)					
							)					
						)
					)
				)
			),
			
		queryTable:
			TABLE({class: 'cfdump_query'},
				TBODY(
					TR(
						TH({class:'query',colspan:'$value.COLUMNS|queryColSpan',onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'query')
					),
					TR({bgcolor:'eeaaaa'},
						TD({class:'query',onclick:'$cfdumpToggleRowQry',style:'cursor:pointer;',title:'click to collapse'},'&nbsp;'),
						FOR('column','$value.COLUMNS',						
							TD({class:'query'},'$column')
						)				
					),
					FOR('row','$value.DATA',
						TR(
							TD({class:'query',onclick:'$cfdumpToggleRowQry',style:'cursor:pointer;',title:'click to collapse'},'$row.index'),
							FOR('col','$row.DATA',						
								TD('$col')
							)					
						)				
					)
				)
			),			
					
		structTable:
			TABLE({class:'cfdump_struct'},
				TBODY(
					TR(
						TH({class:'struct',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'struct')
					),				
					FOR('x','$value',
						TR(
							TD({class:'struct',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
							TD(
								TAG('$x.val|format',{value:'$x.val|parseParts'})
							)							
						)
					)	
				)					
			),
			
		wddxTable:
			TABLE({class:'cfdump_wddx'},
				TBODY(
					TR(
						TH({class:'wddx',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'wddx encoded')
					),
					TR(
						TD({valign:'top'},
							TAG('$value|format',{value:'$value|parseParts'})			
						)
					)
				)			
			),
			
		xmlDocTable:
			TABLE({class:'cfdump_xml'},
				TBODY(
					TR(
						TH({class:'xml',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'xml document')
					),
					FOR('x','$value',
						TR(
							TD({class:'xml',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
							TD(
								TAG('$x.val|format',{value:'$x.val|parseParts'})
							)							
						)
					)
				)		
			),
			
		xmlElemTable:
			TABLE({class:'cfdump_xml'},
				TBODY(
					TR(
						TH({class:'xml',colspan:2,onclick:'$cfdumpToggleTable',style:'cursor:pointer;',title:'click to collapse'},'xml element')
					),
					FOR('x','$value',
						TR(
							TD({class:'xml',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
							TD(
								TAG('$x.val|format',{value:'$x.val|parseParts'})
							)							
						)
					)
				)		
			),
		
		xmlNodeTable:
			TABLE({class:'cfdump_xml'},
				TBODY(
					FOR('x','$value',
						TR(
							TD({class:'xml',onclick:'$cfdumpToggleRow',style:'cursor:pointer;',title:'click to collapse'},'$x.name'),
							TD(
								TAG('$x.val|format',{value:'$x.val|parseParts'})
							)							
						)
					)
				)		
			),
					
		simpleDiv:
			DIV('$value'),
					
		unknownDiv:
			DIV('$value|formatString'),
				
		formatParamName: function(param) {
			return (param.hasOwnProperty("NAME")) ? param.NAME : "";			
		},
		
		formatParamRequired: function(param) {
			if (param.hasOwnProperty("REQUIRED")){
				if (param.REQUIRED == true) {
					return "Required";
				} else {
					return "Optional";
				}
			} else {
				return "";
			}	
		},
		
		formatParamType: function(param) {
			return (param.hasOwnProperty("TYPE")) ? param.TYPE : "";	
		},
		
		formatParamDefault: function(param) {
			if (param.hasOwnProperty("DEFAULT")){
				if (param.DEFAULT == "") {
					return "[empty string]";
				} else {
					return param.DEFAULT;
				}
			} else {
				return "";
			}	
		},
				
		formatUDFArguments: function(value) {
			if (value.hasOwnProperty("PARAMETERS") && value.PARAMETERS.length > 0) {
				return this.argumentsTable;
			} else {
				return this.argumentsRow;
			}
		},
		
		formatUDFReturnType: function(value) {
			return (value.hasOwnProperty("RETURNTYPE")) ? value.RETURNTYPE : "";
		},
		
		formatUDFRoles: function(value) {
			return (value.hasOwnProperty("ROLES")) ? value.ROLES : "";
		},
		
		formatUDFAccess: function(value) {
			return (value.hasOwnProperty("ACCESS")) ? value.ACCESS : "";
		},
		
		formatUDFOutput: function(value) {
			return (value.hasOwnProperty("OUTPUT")) ? value.OUTPUT : "";
		},
		
		formatUDFDisplayName: function(value) {
			return (value.hasOwnProperty("DISPLAYNAME")) ? value.DISPLAYNAME : "";
		},
		
		formatUDFHint: function(value) {
			return (value.hasOwnProperty("HINT")) ? value.HINT : "";
		},
		
		formatUDFDescription: function(value) {
			return (value.hasOwnProperty("DESCRIPTION")) ? value.DESCRIPTION : "";
		},
		
		formatString: function(value){
			return "unknown object type:" + value.toString();
		},
		
		queryColSpan: function(value) {
			return value.length + 1;
		},
		
		format: function(value){						
			
			switch (this.dumpType(value)) {				
				case "array":				
					return this.arrayTable;
				case "binary":
					return this.binaryTable;
				case "customfunction":
					return this.customfunctionTable;					
				case "simpleValue":
					return this.simpleDiv;	
				case "component":
					return this.componentTable;
				case "java":
					return this.objectTable;
				case "query":
					return this.queryTable;				
				case "struct":
					return this.structTable;
				case "wddx":
					return this.wddxTable;
				case "xmldoc":
					return this.xmlDocTable;
				case "xmlelem":
					return this.xmlElemTable;
				case "xmlnode":
					return this.xmlNodeTable;
				case "unknown":
					return this.unknownDiv;				
			}					
								
		},
					
		parseParts: function(value) {
			
			var parts = [];
			var part;
					
			switch (this.dumpType(value)) {
				
				case "array":					
					for (var i=0; i < value.length; i++) {
						part = {name: i+1, val: value[i] };
						parts.push(part);
					}
					return parts;				
					
				case "binary":
					if (value.length > 1000) {
						value.data += ' [truncated]';
					}
					return value;
					
				case "customfunction":
					return value;
					
				case "simpleValue":
					return value;
					
				case "component":
					return value;
					
				case "java":
					return value;
				
				case "query":
					var columns = value.COLUMNLIST.split(',');					
					for (var i = 0; i < value.DATA[columns[0]].length; i++) {
						part = {index: i + 1};
						part.DATA = [];
						for (var j = 0; j < columns.length; j++) {
							part.DATA.push(value.DATA[columns[j]][i]);							
						}
						parts.push(part);						
					}
									
					return {RECORDCOUNT: value.recordcount, COLUMNS: columns, DATA: parts};
					
				case "struct":
				case "xmldoc":
				case "xmlelem":
				case "xmlnode":
					for (var i in value) {
						if (i != "__cftype__") {
							part = {name: i, val: value[i] };
							parts.push(part);						
						}					
					}
					return parts;	
				
				case "wddx":
					return value.data;
					
				case "unknown":
					return value;	
					
				default:
					return value;		
				
			}
		},
		
		dumpType: function(value) {
			
			if (value instanceof Array) {				
				return "array";					
			} else if (typeof(value) == "object" && value.hasOwnProperty("__cftype__")) {
				return value.__cftype__;	
			} else if (typeof(value) == "object" && value.hasOwnProperty("RECORDCOUNT") && value.hasOwnProperty("DATA")) {
				return "query";	
			} else if (typeof(value) == "string" || typeof(value) == "number" || typeof(value) == "boolean") {
				return "simpleValue";					
			} else {					
				return "unknown";					
			}			
			
		},
		
		cfdumpToggleTable: function(event){
			var source = event.currentTarget;			
			
			var switchToState = this.cfdumpToggleSource( source ) ;
			var table = source.parentNode.parentNode;			
			
			for ( var i = 1; i < table.childNodes.length; i++ ) {
				target = table.childNodes[i] ;
				if(target.style) {
					this.cfdumpToggleTarget( target, switchToState ) ;
				}
			}
			
		},
		
		cfdumpToggleRow: function(event){				
			var source = event.currentTarget;
			var element = null;
			var vLen = source.parentNode.childNodes.length;
			for(var i=vLen-1;i>0;i--){
				if(source.parentNode.childNodes[i].nodeType == 1){
					element = source.parentNode.childNodes[i];
					break;
				}
			}
			if(element == null)
				target = source.parentNode.lastChild;
			else
				target = element;
					
			this.cfdumpToggleTarget( target, this.cfdumpToggleSource( source ) ) ;
		},
		
		cfdumpToggleSource: function( source ){
			if ( source.style.fontStyle == 'italic' || source.style.fontStyle == null) {
				source.style.fontStyle = 'normal' ;
				source.title = 'click to collapse' ;
				return 'open' ;
			} else {
				source.style.fontStyle = 'italic' ;
				source.title = 'click to expand' ;
				return 'closed' ;
			}
		},

		cfdumpToggleTarget: function( target, switchToState ){
			if ( switchToState == 'open' )	target.style.display = '' ;
			else target.style.display = 'none' ;
		},
		
		cfdumpToggleRowQry: function(event) {
			var source = event.currentTarget;
			var expand = (source.title == "click to collapse") ? "closed" : "open";
			var target = null;
			var vLen = source.parentNode.childNodes.length;
			for(var i=vLen-1;i>=1;i--){
				if(source.parentNode.childNodes[i].nodeType == 1){
					target = source.parentNode.childNodes[i];
					this.cfdumpToggleTarget( target, expand );
					this.cfdumpToggleSourceQry( source, expand );
				}
			}
			if(target == null){
				//target is the last cell
				target = source.parentNode.lastChild;
				this.cfdumpToggleTarget( target, this.cfdumpToggleSource( source ) ) ;
			}			
		},	
		
		cfdumpToggleSourceQry: function(source, expand) {
			if(expand == "closed"){
				source.title = "click to expand";
				source.style.fontStyle = "italic";
			}
			else{
				source.title = "click to collapse";
				source.style.fontStyle = "normal";
			}
		},	
		
		/* this code for query formatting needs to be updated to use the domplate */
		
		cfsqltypes: [
			"unknown",
			//numeric types
			"cf_sql_bigint", "cf_sql_bit", "cf_sql_blob", "cf_sql_decimal", "cf_sql_double", "cf_sql_float", "cf_sql_integer", "cf_sql_money", "cf_sql_money4", "cf_sql_numeric", "cf_sql_real", "cf_sql_refcursor", "cf_sql_smallint", "cf_sql_tinyint", 
			//date time types
			"cf_sql_date", "cf_sql_time", "cf_sql_timestamp",
			//text types
			"cf_sql_char", "cf_sql_clob", "cf_sql_idstamp", "cf_sql_longvarchar", "cf_sql_varchar"	
		],
		
		formatQuery: function( sql, params){		
			var sqlText = sql;
			if (params.length && params.length > 0) {
				// find out how many question marks we have in the query
				var questionMarks = sqlText.match(/\?/g);
				// if the number of question marks matches the number of values 
				// and the option to parse is set to true go ahead and replace 
				// question marks with parameter values	
				if ((params.length == questionMarks.length) && ColdFire['parseParams'] ) {	
					for (var i = 0; i < params.length; i++) {
						// get the formatted value	
						var val = this.formatParamValue(params[i]);
						sqlText = sqlText.replace(/\?/,val);
					}				
				} else {
					sqlText += this.formatQueryParams(params);
				}
			}
			return sqlText;		
		},
		
		formatQueryParams: function( params ){
			if (params.length > 0){
				var paramString = new StringBuffer();
				paramString.append("<I><BR/>" + $CFSTR("QueryParamValues") + " -");
				for( var x = 0; x < params.length; x++ ){
					paramString.append("<BR/>" + $CFSTR("Parameter") + "#" + (x + 1) + "(" + this.cfsqltypes[params[x][0]] + ") = " + this.escapeHTML(params[x][1]));
				}
				paramString.append("</I>");
				return paramString.toString();
			}
			return "";
		},
		
		formatSPParams: function( params ) {		
			if (params.length > 0) {
				var tblString = new StringBuffer();
				tblString.append("<TABLE border='0' cellpadding='2' cellspacing='0' width='100%'><TR style='background-color:#CCCCCC'><TH colspan='5' align='center'><B>" + $CFSTR("StoredProcedureParameters") + "</B></TH></TR><TR><TD><I>" + $CFSTR("lcType") + "</I></TD><TD><I>" + $CFSTR("lcCFSqlType") + "</I></TD><TD><I>" + $CFSTR("lcValue") +"</I></TD><TD><I>" + $CFSTR("lcVariable") + "</I></TD><TD><I>" + $CFSTR("lcDBVarname") + "</I></TD></TR>");
				for( var x = 0; x < params.length; x++ ){
					tblString.append("<TR><TD>" + params[x][0] + "</TD><TD>" + this.cfsqltypes[params[x][1]] + "</TD><TD>" + this.escapeHTML(params[x][2]) + "</TD><TD>" + params[x][3] + "</TD><TD>" + params[x][4] + "</TD></TR>");
				}
				tblString.append("</TABLE>");
				return tblString.toString();			
			}		
			return "";
		},
		
		formatSPResultSets: function( reslutsets ) {
			if (reslutsets.length > 0) {
				var tblString = new StringBuffer();
				tblString.append("<TABLE border='0' cellpadding='2' cellspacing='0' width='100%'><TR style='background-color:#CCCCCC'><TH colspan='5' align='center'><B>" + $CFSTR("StoredProcedureResultSets") + "</B></TH></TR><TR><TD><I>" + $CFSTR("lcName") + "</I></TD><TD><I>" + $CFSTR("lcResultset") + "</I></TD></TR>");
				for( var x = 0; x < reslutsets.length; x++ ){
					tblString.append("<TR><TD>" + reslutsets[x][0] + "</TD><TD>" + reslutsets[x][1] + "</TD</TR>");
				}
				tblString.append("</TABLE>");
				return tblString.toString();			
			}		
			return "";
		},
		
		formatParamValue: function( param ) {
			var type = param[0];
			var value = param[1];
			var tmpVal = value;
			if (type == 2){
				// handle bit types
				tmpVal = (value == "1" || value.toUpperCase() == "TRUE" || value.toUpperCase() == "YES") ? 1 : 0;
			} else if ( type < 15){
				// handle numeric types
				tmpVal =  value;
			} else if (type < 18) {
				// handle date time types
				tmpVal = (value.indexOf("{") == 0) ? value : "'" + value + "'";
			} else if (type < 23) {
				// handle text types
				tmpVal = "'" + value.replace(/'/, "''") + "'";
			}		
			return this.escapeHTML(tmpVal);		
		}
		
		
	});

	this.ColdFireFormatter = new ColdFireFormatter();
	
}).apply(FirebugLib);	
}
