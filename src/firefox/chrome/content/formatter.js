function ColdFireFormatter() {} 
ColdFireFormatter.prototype =
{
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
	},
	escapeHTML: function (value){
		function replaceChars(ch)
        {
            switch (ch)
            {
                case "<":
                    return "&lt;";
                case ">":
                    return "&gt;";
                case "&":
                    return "&amp;";
                case "'":
                    return "&#39;";
                case '"':
                    return "&quot;";
            }
            return "?";
        };
        return String(value).replace(/[<>&"']/g, replaceChars);
	}	
};

function StringBuffer()
{
	this.buffer = [];
}
StringBuffer.prototype.append = function(string)
{
	this.buffer.push(string);
	return this;
}
StringBuffer.prototype.toString = function()
{
	return this.buffer.join("");
}