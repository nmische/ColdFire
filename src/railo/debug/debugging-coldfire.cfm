<!---
	Name:			debugging-coldfire.cfm
	Author:			Nathan Mische
	Created:		5/19/2009
--->


<!--- Check that ColdFire is enabled --->
<cfif IsDebugMode()
	and StructKeyExists(GetHttpRequestData().headers,"User-Agent")
	and FindNoCase("ColdFire",GetHttpRequestData().headers["User-Agent"]) gt 0>
	
	<!--- Do we have the correct version of the extension for this debug template --->
	<cfif REFind("ColdFire/\d*\.\d*\.@CF_REVISION@\.\d*",GetHttpRequestData().headers["User-Agent"]) gt 0>
		<!--- Build Headers --->
		<cfset coldfire_udf_main(debugMode=false,maxHeader=8000)>
	<cfelse>
		<!--- Return Error --->
		<cfset coldfire_udf_error(debugMode=false,maxHeader=8000,msg="This version of the ColdFire extension, #REReplace(GetHttpRequestData().headers['User-Agent'],'.*ColdFire/(\d*[\.\d*]+).*','\1')#, is incompatible with the server's version of the ColdFire debug template, @CF_REVISION@.")>
	</cfif>	

<!--- Set to true if you would like to fall back to a different template --->
<cfelseif false>

	<cfinclude template="debugging-neo.cfm" />
		
</cfif>


<cffunction 
	name="coldfire_udf_error" 
	returntype="void" 
	output="true"
	hint="Returns an error message in the general header.">
	
	<cfargument name="debugMode" type="boolean" required="false" default="false">
	<cfargument name="maxHeader" type="numeric" required="false" default="8000">
	<cfargument name="msg" type="string" required="true">
	
	<cfset var result = StructNew()>
	<cfset var general = queryNew("label,value")>
	
	<cfset queryAddRow(general)>
	<cfset querySetCell(general, "label", "Error")>
	<cfset querySetCell(general, "value", arguments.msg)>
	
	<cfset result.general= coldfire_udf_encode(general)>
	<cfset result.general = coldfire_udf_sizeSplit(result.general, arguments.maxHeader)>
	
	<cfif arguments.debugMode>
		<cfdump var="#result#">
	</cfif>

	<cftry>
	<cfloop index="x" from="1" to="#arrayLen(result.general)#">
		<cfheader name="x-coldfire-general-#x#" value="#result.general[x]#">
	</cfloop>
	<cfcatch></cfcatch>
	</cftry>	
	
</cffunction>


<cffunction 
	name="coldfire_udf_getCFCs"
	returntype="query"
	output="false" 
	hint="Gets CFC from the debugging info">
		
	<cfargument name="data" type="struct" required="true">
	
	<cfset var pages = data.pages>	
	<cfset var first_result = "">
	<cfset var result = queryNew("cfc,method,totaltime,totalinstances,avgtime")>
	<cfset var cfc = "">
	<cfset var method = "">	
	
	<cfquery dbType="query" name="first_result" debug="false">
		select src as template, total as totaltime, count as totalinstances, avg as avgtime
		from pages
		where src like '%.cfc%'
	</cfquery>

	<cfloop query="first_result">
		<cfset queryAddRow(result)>		
		<cfset cfc = trim(listFirst(template,"$"))>		
		<cfset querySetCell(result, "cfc", cfc)>
		<cfif find("$",template)>		
			<cfset method = trim(listLast(template,"$"))>
		<cfelse>
			<cfset method = "">
		</cfif>
		<cfset querySetCell(result, "method",method)>
		<cfset querySetCell(result, "totaltime", totaltime)>
		<cfset querySetCell(result, "totalinstances", totalinstances)>
		<cfset querySetCell(result, "avgtime", avgtime)>		
	</cfloop>
	
	<cfreturn result>	
</cffunction>


<cffunction 
	name="coldfire_udf_getChildTemplates"
	returntype="query"
	output="false" 
	hint="Gets includes, custom tags.">
		
	<cfargument name="data" type="struct" required="true">

	<cfset var result = queryNew("template,totaltime,totalinstances,avgtime")>
	
	<!--- TODO: Join with history and figure out which templates are child templates --->
	
	<cfreturn result />	
	
</cffunction>

<cffunction 
	name="coldfire_udf_getGeneral"
	returntype="query"
	output="false"
	hint="Gets General info">
	
	<cfargument name="data" type="struct" required="true">
	
	<cfset var result = queryNew("label,value")>
	<cfset var myapp = "">
	<cfset var totaltime = 0>
	<cfset var cfdebug_execution = "">
	<cfset var pages = data.pages>
	
	<cfif isDefined("application.applicationname")>
		<cfset myapp = application.applicationName>
	</cfif>	
	
	<cfloop query="pages">
		<cfset totaltime = totaltime + pages.total>
	</cfloop>	
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Server")>
	<cfset querySetCell(result, "value", "#server.coldfusion.productname# #coldfire_udf_ucase_first(server.coldfusion.productlevel)# #uCase(server.railo.state)# #server.railo.version# (CFML Version #server.ColdFusion.ProductVersion#)")>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Template")>
	<cfset querySetCell(result, "value", "#cgi.SCRIPT_NAME# (#getBaseTemplatePath()#)")>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Timestamp")>
	<cfset querySetCell(result, "value", "#LSDateFormat(now())# #LSTimeFormat(now())#")>	
	
	<cftry>
		<cfset queryAddRow(result)>
		<cfset querySetCell(result, "label", "Time Zone")>
		<cfset querySetCell(result, "value", GetPageContext().getConfig().getTimeZone().getDisplayName())>
	<cfcatch></cfcatch>
	</cftry>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Locale")>
	<cfset querySetCell(result, "value", coldfire_udf_ucase_first(getLocale()))>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "UserAgent")>
	<cfset querySetCell(result, "value", cgi.http_user_agent)>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "RemoteIP")>
	<cfset querySetCell(result, "value", cgi.remote_addr)>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "HostName")>
	<cfset querySetCell(result, "value", cgi.server_name)>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Application")>
	<cfset querySetCell(result, "value", myapp)>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "TotalExecTime")>
	<cfset querySetCell(result, "value", totaltime)>
		
	<cfreturn result>
	
</cffunction>

<cffunction 
	name="coldfire_udf_getQueries" 
	returnType="query"
	output="false"  
	hint="Gets queries from debugging info">
		
	<cfargument name="data" type="struct" required="true">
	
	<cfset var result = queryNew("datasource, queryname, et, sql, parameters, resultsets, recordsreturned, type, cachedquery, template, timestamp")>	
	<cfset var coldfire_queries = data.queries>	
	
	<!--- Add SQL queries to the result --->
	<cfloop query="coldfire_queries">		
		<cfset QueryAddRow(result)>
		<cfset QuerySetCell(result,"datasource",coldfire_queries.datasource)>
		<cfset QuerySetCell(result,"queryname",coldfire_queries.name)>
		<cfset QuerySetCell(result,"et",coldfire_queries.time)>		
		<cfset QuerySetCell(result,"sql",coldfire_queries.sql)>
		<cfset QuerySetCell(result,"parameters",ArrayNew(1))>
		<cfset QuerySetCell(result,"resultsets","")>
		<cfset QuerySetCell(result,"recordsreturned",Max(coldfire_queries.count, 0))>
		<cfset QuerySetCell(result,"type","SqlQuery")>
		<cfset QuerySetCell(result,"cachedquery","")>
		<cfset QuerySetCell(result,"template",coldfire_queries.src)>
		<cfset QuerySetCell(result,"timestamp","")>	
	</cfloop>
	
	<cfreturn result>
	
</cffunction>

<cffunction 
	name="coldfire_udf_getTemplates" 
	returtType="query"
	output="false" 
	hint="Gets templates.">
	
	<cfargument name="data" type="struct" required="true">

	<cfset var pages = data.pages>	
	
	<!--- TODO: Join with history and figure out which templates are top level templates --->
	
	<cfquery dbType="query" name="result" debug="false">
		select src as template, total as totaltime, count as totalinstances, avg as avgtime
		from pages
		where src like '%.cfm'
	</cfquery>
	
	<cfreturn result>	
	
</cffunction>

<!---


<cffunction 
	name="coldfire_udf_getTimer"
	returntype="query"  
	output="false"		
	hint="Gets Timer info">
		
	<cfargument name="data" type="query" required="true">
	
	<cfset var result = queryNew("")>
	
	<cfquery dbType="query" name="result" debug="false">
	select	message, endtime-starttime as duration
	from arguments.data
	where type = 'CFTimer'
	</cfquery>

	<cfreturn result>
</cffunction>




<cffunction 
	name="coldfire_udf_getTrace"
	returntype="query"
	output="false"  
	hint="Gets Trace info">
	
	<cfargument name="data" type="query" required="true">
	
	<cfset var result = queryNew("")>
	<cfset var last = 0>
	
	<cfquery dbType="query" name="result" debug="false">
	select message, endtime, priority, category, result
	from data
	where type = 'Trace'
	</cfquery>

	<!--- before we leave, do delta --->
	<cfset queryAddColumn(result, "delta", arrayNew(1))>
	
	<cfloop query="result">
		<cfif currentRow is 1>
			<cfset querySetCell(result, "delta", 0, currentRow)>
		<cfelse>
			<cfset querySetCell(result, "delta", endtime-last, currentRow)>
		</cfif>
		
		<cfset last = endtime>
				
	</cfloop>
	
	<cfreturn result>
</cffunction>




<cffunction
	name="coldfire_udf_getVariables"
	returntype="query"
	output="false"
	hint="Get Variable values">
	
	<cfargument name="variableNames" type="array" required="true">
	
	<cfset var __coldfireResult__ = queryNew("label,value")>
	<cfset var __coldfireX__ = 1>
	
	<cfloop index="__coldfireX__" from="1" to="#arrayLen(arguments.variableNames)#">
			
		<cftry>
			
			<cfset QueryAddRow(__coldfireResult__)>		
				
			<!--- set the label --->
			<cfset QuerySetCell(__coldfireResult__,"label",arguments.variableNames[__coldfireX__])>
			
			<cfif CompareNoCase(variableNames[__coldfireX__],"variables") neq 0 and IsDefined(variableNames[__coldfireX__])>								
				<!--- get the value --->
				<cfset QuerySetCell(__coldfireResult__,"value",coldfire_udf_encode(evaluate(variableNames[__coldfireX__])))>			
			<cfelseif StructKeyExists(request,"__coldFireVariableValues__") and StructKeyExists(request.__coldFireVariableValues__,variableNames[__coldfireX__])>
				<!--- check to see if we were using application.cfm --->
				<cfset QuerySetCell(__coldfireResult__,"value",coldfire_udf_encode(evaluate("request.__coldFireVariableValues__." & variableNames[__coldfireX__])))>
			<cfelseif CompareNoCase(variableNames[__coldfireX__],"variables") eq 0>
				<!--- get the value --->
				<cfset QuerySetCell(__coldfireResult__,"value",coldfire_udf_encode(evaluate(variableNames[__coldfireX__])))>	
			<cfelse>
				<!--- set default value --->
				<cfset QuerySetCell(__coldfireResult__,"value",coldfire_udf_encode("undefined"))>			
			</cfif>
		
			<cfcatch>
				<!--- do nothing --->
			</cfcatch>
		
		</cftry>
		
	</cfloop>
	
	<cfreturn __coldfireResult__>
	
</cffunction>


--->

<cffunction 
	name="coldfire_udf_main" 
	returntype="void" 
	output="true"
	hint="Build and set Coldfire HTTP headers">
		
	<cfargument name="debugMode" type="boolean" required="false" default="false">
	<cfargument name="maxHeader" type="numeric" required="false" default="8000">
	
	<cfset var debugging = "">
	<cfset var result = StructNew()>
	<cfset var varJSON = "">
	<cfset var varArray = ArrayNew(1)>	
	<cfset var requestData = GetHttpRequestData()>
	
	<!--- Gets the debug data. --->
	<cfadmin action="getDebugData" returnVariable="debugging">
			
	<cftry>
	
	<cfif not IsDebugMode()>
		<!--- Return Error --->
		<cfset coldfire_udf_error(debugMode=false,maxHeader=8000,msg="The coldfusion debugging service does not appear to be running.")>
		<cfreturn>
	</cfif>
		
	<cfif structKeyExists(requestData.headers,"x-coldfire-variables")>
		<cfset varJSON = requestData.headers["x-coldfire-variables"]>
		<cfset varArray = coldfire_udf_decode(varJSON)>
	</cfif>			
	
	<cfset result.general= coldfire_udf_encode(coldfire_udf_getGeneral(debugging))>	
	<cfset result.templates = coldfire_udf_encode(coldfire_udf_getTemplates(debugging))>		
	<cfset result.ctemplates = coldfire_udf_encode(coldfire_udf_getChildTemplates(debugging))>
	<cfset result.cfcs = coldfire_udf_encode(coldfire_udf_getCFCs(debugging))>
	<cfset result.queries = coldfire_udf_encode(coldfire_udf_getQueries(debugging))>
	<!---
	<cfset result.trace = coldfire_udf_encode(coldfire_udf_getTrace(qEvents))>			
	<cfset result.timer = coldfire_udf_encode(coldfire_udf_getTimer(qEvents))>			
	<cfset result.variables = coldfire_udf_encode(coldfire_udf_getVariables(varArray))>
	--->

	<!--- now split into arrays --->
	<cfset result.general = coldfire_udf_sizeSplit(result.general, arguments.maxHeader)>
	<cfset result.templates = coldfire_udf_sizeSplit(result.templates, arguments.maxHeader)>
	<cfset result.ctemplates = coldfire_udf_sizeSplit(result.ctemplates, arguments.maxHeader)>
	<cfset result.cfcs = coldfire_udf_sizeSplit(result.cfcs, arguments.maxHeader)>
	<cfset result.queries = coldfire_udf_sizeSplit(result.queries, arguments.maxHeader)>
	<!---
	<cfset result.trace = coldfire_udf_sizeSplit(result.trace, arguments.maxHeader)>
	<cfset result.timer = coldfire_udf_sizeSplit(result.timer, arguments.maxHeader)>
	<cfset result.variables = coldfire_udf_sizeSplit(result.variables, arguments.maxHeader)>
	--->


	<cfif arguments.debugMode>
		<cfdump var="#result#">
	</cfif>
	
	<cfloop index="x" from="1" to="#arrayLen(result.general)#">
		<cfheader name="x-coldfire-general-#x#" value="#result.general[x]#">
	</cfloop>	
	<cfloop index="x" from="1" to="#arrayLen(result.templates)#">
		<cfheader name="x-coldfire-templates-#x#" value="#result.templates[x]#">
	</cfloop>
	<cfloop index="x" from="1" to="#arrayLen(result.ctemplates)#">
		<cfheader name="x-coldfire-ctemplates-#x#" value="#result.ctemplates[x]#">
	</cfloop>	
	<cfloop index="x" from="1" to="#arrayLen(result.cfcs)#">
		<cfheader name="x-coldfire-cfcs-#x#" value="#result.cfcs[x]#">
	</cfloop>	
	<cfloop index="x" from="1" to="#arrayLen(result.queries)#">
		<cfheader name="x-coldfire-queries-#x#" value="#result.queries[x]#">
	</cfloop>
	<!---
	<cfloop index="x" from="1" to="#arrayLen(result.trace)#">
		<cfheader name="x-coldfire-trace-#x#" value="#result.trace[x]#">				
	</cfloop>
	<cfloop index="x" from="1" to="#arrayLen(result.timer)#">
		<cfheader name="x-coldfire-timer-#x#" value="#result.timer[x]#">				
	</cfloop>
	<cfloop index="x" from="1" to="#arrayLen(result.variables)#">
		<cfheader name="x-coldfire-variables-#x#" value="#result.variables[x]#">				
	</cfloop>
	--->
	
	<cfcatch>
		<!--- make sure we don't throw an error --->
		<cfrethrow/>
	</cfcatch>
	
	</cftry>	

</cffunction>

	

	
<!--- UTILITY FUNCTIONS --->




<cffunction 
	name="coldfire_udf_CFDebugSerializable"
	returntype="string"
	output="false"
	hint="Handle output of complex data types.Taken from classic.cfm.">
		
	<cfargument name="variable" type="any" required="true">
	
	<cfset var ret = "undefined">
	
	<cftry>
		<cfif IsSimpleValue(variable)>		
			<cfset ret = xmlFormat(variable)>				
		<cfelseif IsStruct(variable)>
			<cfset ret = ("Struct (" & StructCount(variable) & ")")>			
		<cfelseif IsArray(variable)>
			<cfset ret = ("Array (" & ArrayLen(variable) & ")")>			
		<cfelseif IsQuery(variable)>
			<cfset ret = ("Query (" & variable.RecordCount & ")")>			
		<cfelse>
			<cfset ret = ("Complex type")>				
		</cfif>		
		<cfcatch></cfcatch>
	</cftry>
	
	<cfreturn ret>

</cffunction>




<cffunction 
	name="coldfire_udf_decode" 
	returntype="any" 
	output="false"
	hint="Converts data frm JSON to CF format">
	
	<cfargument name="data" type="string" required="Yes" />
	
	<!--- DECLARE VARIABLES --->
	<cfset var ar = ArrayNew(1) />
	<cfset var st = StructNew() />
	<cfset var dataType = "" />
	<cfset var inQuotes = false />
	<cfset var startPos = 1 />
	<cfset var nestingLevel = 0 />
	<cfset var dataSize = 0 />
	<cfset var i = 1 />
	<cfset var skipIncrement = false />
	<cfset var j = 0 />
	<cfset var char = "" />
	<cfset var dataStr = "" />
	<cfset var structVal = "" />
	<cfset var structKey = "" />
	<cfset var colonPos = "" />
	<cfset var qRows = 0 />
	<cfset var qCol = "" />
	<cfset var qData = "" />
	<cfset var unescapeVals = "\"",\',\\,\/,\b,\t,\n,\f,\r" />
	<cfset var unescapeToVals = """,',\,/,#Chr(8)#,#Chr(9)#,#Chr(10)#,#Chr(12)#,#Chr(13)#" />
	
	<cfset var _data = Trim(arguments.data) />

	<!--- NULL --->
	<cfif NOT IsNumeric(_data) AND _data EQ "null">
		<cfreturn "" />
	
	<!--- BOOLEAN --->
	<cfelseif NOT IsNumeric(_data) AND ListFindNoCase("True,False", _data)>
		<cfreturn _data />
	
	<!--- NUMBER --->
	<cfelseif IsNumeric(_data)>
		<cfreturn _data />
	
	<!--- EMPTY STRING --->
	<cfelseif _data EQ "''" OR _data EQ '""'>
		<cfreturn "" />
	
	<!--- STRING --->
	<cfelseif ReFind('^".+"$', _data) EQ 1 OR ReFind("^'.+'$", _data) EQ 1>
		<cfreturn ReplaceList( mid(_data, 2, Len(_data)-2), unescapeVals, unescapeToVals) />
	
	<!--- ARRAY, STRUCT, OR QUERY --->
	<cfelseif ReFind("^\[.*\]$", _data) EQ 1
		OR ReFind("^\{.*\}$", _data) EQ 1
		OR ReFindNoCase('^\{"recordcount":[0-9]+,"columnlist":"[^"]+","data":\{("[^"]+":\[[^]]*\],?)+\}\}$', _data, 0) EQ 1>
		
		<!--- Store the data type we're dealing with --->
		<cfif ReFind("^\[.*\]$", _data) EQ 1>
			<cfset dataType = "array" />
		<cfelseif ReFindNoCase('^\{"recordcount":[0-9]+,"columnlist":"[^"]+","data":\{("[^"]+":\[[^]]*\],?)+\}\}$', _data, 0) EQ 1>
			<cfset dataType = "query" />
		<cfelse>
			<cfset dataType = "struct" />
		</cfif>
		
		<!--- Remove the brackets --->
		<cfset _data = Trim( Mid(_data, 2, Len(_data)-2) ) />
		
		<!--- Deal with empty array/struct --->
		<cfif Len(_data) EQ 0>
			<cfif dataType EQ "array">
				<cfreturn ar />
			<cfelse>
				<cfreturn st />
			</cfif>
		</cfif>
		
		<!--- Loop through the string characters --->
		<cfset dataSize = Len(_data) + 1 />
		<cfloop condition="#i# LTE #dataSize#">
			<cfset skipIncrement = false />
			<!--- Save current character --->
			<cfset char = Mid(_data, i, 1) />
			
			<!--- If char is a quote, switch the quote status --->
			<cfif char EQ '"'>
				<cfset inQuotes = NOT inQuotes />
			<!--- If char is escape character, skip the next character --->
			<cfelseif char EQ "\" AND inQuotes>
				<cfset i = i + 2 />
				<cfset skipIncrement = true />
			<!--- If char is a comma and is not in quotes, or if end of string, deal with data --->
			<cfelseif (char EQ "," AND NOT inQuotes AND nestingLevel EQ 0) OR i EQ Len(_data)+1>
				<cfset dataStr = Mid(_data, startPos, i-startPos) />
				
				<!--- If data type is array, append data to the array --->
				<cfif dataType EQ "array">
					<cfset arrayappend( ar, coldfire_udf_decode(dataStr) ) />
				<!--- If data type is struct or query... --->
				<cfelseif dataType EQ "struct" OR dataType EQ "query">
					<cfset dataStr = Mid(_data, startPos, i-startPos) />
					<cfset colonPos = Find(":", dataStr) />
					<cfset structKey = Trim( Mid(dataStr, 1, colonPos-1) ) />
					
					<!--- If needed, remove quotes from keys --->
					<cfif Left(structKey, 1) EQ "'" OR Left(structKey, 1) EQ '"'>
						<cfset structKey = Mid( structKey, 2, Len(structKey)-2 ) />
					</cfif>
					
					<cfset structVal = Mid( dataStr, colonPos+1, Len(dataStr)-colonPos ) />
					
					<!--- If struct, add to the structure --->
					<cfif dataType EQ "struct">
						<cfset StructInsert( st, structKey, coldfire_udf_decode(structVal) ) />
					
					<!--- If query, build the query --->
					<cfelse>
						<cfif structKey EQ "recordcount">
							<cfset qRows = coldfire_udf_decode(structVal) />
						<cfelseif structKey EQ "columnlist">
							<cfset st = QueryNew( coldfire_udf_decode(structVal) ) />
							<cfif qRows>
								<cfset QueryAddRow(st, qRows) />
							</cfif>
						<cfelseif structKey EQ "data">
							<cfset qData = coldfire_udf_decode(structVal) />
							<cfset ar = StructKeyArray(qData) />
							<cfloop from="1" to="#ArrayLen(ar)#" index="j">
								<cfloop from="1" to="#st.recordcount#" index="qRows">
									<cfset qCol = ar[j] />
									<cfset QuerySetCell(st, qCol, qData[qCol][qRows], qRows) />
								</cfloop>
							</cfloop>
						</cfif>
					</cfif>
				</cfif>
				
				<cfset startPos = i + 1 />
			<!--- If starting a new array or struct, add to nesting level --->
			<cfelseif "{[" CONTAINS char AND NOT inQuotes>
				<cfset nestingLevel = nestingLevel + 1 />
			<!--- If ending an array or struct, subtract from nesting level --->
			<cfelseif "]}" CONTAINS char AND NOT inQuotes>
				<cfset nestingLevel = nestingLevel - 1 />
			</cfif>
			
			<cfif NOT skipIncrement>
				<cfset i = i + 1 />
			</cfif>
		</cfloop>
		
		<!--- Return appropriate value based on data type --->
		<cfif dataType EQ "array">
			<cfreturn ar />
		<cfelse>
			<cfreturn st />
		</cfif>
	
	<!--- INVALID JSON --->
	<cfelse>
		<cfthrow message="Invalid JSON" detail="The document you are trying to decode is not in valid JSON format" />
	</cfif>
</cffunction>




<cffunction 
	name="coldfire_udf_encode" 
	returntype="string" 
	output="false"
	hint="Converts data from CF to JSON format">
		
	<cfargument name="data" type="any" required="Yes" />
	<!---
		The following argument allows for formatting queries in query or struct format
		If set to query, query will be a structure of colums filled with arrays of data
		If set to array, query will be an array of records filled with a structure of columns
	--->
	<cfargument name="queryFormat" type="string" required="No" default="query" />
	<cfargument name="queryKeyCase" type="string" required="No" default="upper" />
	<cfargument name="stringNumbers" type="boolean" required="No" default=false >
	<cfargument name="formatDates" type="boolean" required="No" default=false >
	
	<!--- VARIABLE DECLARATION --->
	<cfset var jsonString = "" />
	<cfset var tempVal = "" />
	<cfset var arKeys = "" />
	<cfset var colPos = 1 />
	<cfset var i = 1 />
	
	<cfset var ignoreStructKeys = "_CF_HTMLASSEMBLER,__COLDFIREVARIABLEVALUES__,__COLDFIRETRACEVALUES__,__COLDFIRETRACESTARTTIME__">
	<cfset var ignoreFunctionPrefix = "coldfire_udf">
	
	<cfset var _data = arguments.data />

	<cfset var recordcountKey = "" />
	<cfset var columnlistKey = "" />
	<cfset var columnlist = "" />
	<cfset var dataKey = "" />
	<cfset var column = "" />
	
	<!--- ARRAY --->
	<cfif IsArray(_data) AND NOT IsBinary(_data)>
		<cfset jsonString = ArrayNew(1)/>	
		<cfloop from="1" to="#ArrayLen(_data)#" index="i">
			<cfset tempVal = coldfire_udf_encode( _data[i], arguments.queryFormat, arguments.queryKeyCase ) />
			<cfset ArrayAppend(jsonString, tempVal) />
		</cfloop>		
		<cfreturn "[" & ArrayToList(jsonString,",") & "]" />
		
	<!--- BINARY --->
	<cfelseif IsBinary(_data)>
		<cfset jsonString = ArrayNew(1)/>		
		<cfloop from="1" to="#Min(ArrayLen(_data),1000)#" index="i">
			<cfset ArrayAppend(jsonString,_data[i]) />
		</cfloop>		
		<cfreturn "{""__cftype__"":""binary"",""data"":""" & ArrayToList(jsonString,"") & """,""length"":" & ArrayLen(_data) & "}" />

	<!--- BOOLEAN --->
	<cfelseif IsBoolean(_data) AND NOT IsNumeric(_data) AND NOT ListFindNoCase("Yes,No", _data)>
		<cfreturn LCase(ToString(_data)) />
		
	<!--- CUSTOM FUNCTION --->
	<cfelseif IsCustomFunction(_data)>
		<cfset md = GetMetaData(_data) />
		<cfif CompareNoCase(Left(md.name,Len(ignoreFunctionPrefix)),ignoreFunctionPrefix) eq 0>
			<cfreturn "coldfire_ignore_value" />
		<cfelse>		
			<cfset jsonString = ArrayNew(1) />
			<cfset ArrayAppend(jsonString,"""__cftype__"":""customfunction""")>
			<cfset arKeys = StructKeyArray(md) />
			<cfloop from="1" to="#ArrayLen(arKeys)#" index="i">
				<cfset tempVal = coldfire_udf_encode( md[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
				<cfset ArrayAppend(jsonString, '"' & arKeys[i] & '":' & tempVal) />
			</cfloop>
			<cfreturn "{" & ArrayToList(jsonString,",") & "}" />
		</cfif>	
		
	<!--- NUMBER --->
	<cfelseif NOT stringNumbers AND IsNumeric(_data) AND NOT REFind("^0+[^\.]",_data)>
		<cfreturn ToString(_data) />
	
	<!--- DATE --->
	<cfelseif IsDate(_data) AND arguments.formatDates>
		<cfreturn '"#DateFormat(_data, "mmmm, dd yyyy")# #TimeFormat(_data, "HH:mm:ss")#"' />
		
	<!--- WDDX --->
	<cfelseif IsWDDX(_data)>
		<cfwddx action="wddx2cfml" input="#_data#" output="tempVal" />
		<cfreturn "{""__cftype__"":""wddx"",""data"":" & coldfire_udf_encode( tempVal, arguments.queryFormat, arguments.queryKeyCase ) & "}" />
		
	<!--- STRING --->
	<cfelseif IsSimpleValue(_data)>
		<cfreturn '"' & Replace(JSStringFormat(_data), "/", "\/", "ALL") & '"' />
		
	<!--- OBJECT --->
	<cfelseif IsObject(_data)>	
		<cfset md = GetMetaData(_data) />	
		<cfset arKeys = StructKeyArray(md) />		
		
		<cfif ArrayLen(arKeys) eq 0>
			<!--- java object --->
			<cftry>
				<cfset jsonString = ArrayNew(1) />
				<cfset ArrayAppend(jsonString,"""__cftype__"":""java""") />
				
				<!--- get the class name --->
				
				<cfset ArrayAppend(jsonString,'"CLASSNAME":"' & _data.getClass().getName() & '"') />
				
				<!--- get object method data, this could probabaly use some work --->
				
				<cfset methods = _data.getClass().getMethods()>
				<cfset methodStruct = StructNew() />
				<cfset methodArray = ArrayNew(1) />
				<cfloop from="1" to="#ArrayLen(methods)#" index="i">	
					<cfset methodString = methods[i].getName() & "(" />
					<cfset params = methods[i].getParameterTypes()>
					<cfset delim = ""/>
					<cfloop from="1" to="#ArrayLen(params)#" index="x">
						<cfset methodString = methodString & delim & " " & params[x].getCanonicalName() />
						<cfset delim = "," />
					</cfloop>
					<cfset methodString = methodString & ")" />	
					<cfset methodStruct[methods[i].getName()] = StructNew() />
					<cfset methodStruct[methods[i].getName()].method = methodString />	
					<cfset methodStruct[methods[i].getName()].returntype = methods[i].getReturnType().getCanonicalName() />
				</cfloop>				
				<cfset sortedKeys = StructSort(methodStruct,"textnocase","asc","method") />				
				
				<cfloop from="1" to="#ArrayLen(sortedKeys)#" index="i">
					<cfset ArrayAppend(methodArray,methodStruct[sortedKeys[i]]) />
				</cfloop>

				<cfset tempVal = coldfire_udf_encode( methodArray, arguments.queryFormat, arguments.queryKeyCase ) />
				
				<cfset ArrayAppend(jsonString,'"METHODS":' & tempVal) />
				
				<!--- get object field data, not getting values --->
				<cfset fields = _data.getClass().getFields()>
				<cfset fieldStruct = StructNew() />
				<cfset fieldArray = ArrayNew(1) />				
				<cfloop from="1" to="#ArrayLen(fields)#" index="i">	
					<cfset fieldStruct[fields[i].getName()] = StructNew() />
					<cfset fieldStruct[fields[i].getName()].field = fields[i].getType().getName() & " " & fields[i].getName() />	
					<cfset fieldStruct[fields[i].getName()].value = fields[i].getType().getName() />
				</cfloop>				
				<cfset sortedKeys = StructSort(fieldStruct,"textnocase","asc","field") />
				
				<cfloop from="1" to="#ArrayLen(sortedKeys)#" index="i">
					<cfset ArrayAppend(fieldArray,fieldStruct[sortedKeys[i]]) />
				</cfloop>
				
				<cfset tempVal = coldfire_udf_encode( fieldArray, arguments.queryFormat, arguments.queryKeyCase ) />
				
				<cfset ArrayAppend(jsonString,'"FIELDS":' & tempVal) />
				
				
				<cfreturn "{" & ArrayToList(jsonString,",") & "}" />				
			
				<cfcatch type="any">
					<cfreturn "{""__cftype__"":""unknown""}" />	
				</cfcatch>
			</cftry>			
		<cfelse>
			<!--- component --->		
			<cfset jsonString = ArrayNew(1) />
			<cfset ArrayAppend(jsonString,"""__cftype__"":""component""") />
			<cfloop from="1" to="#ArrayLen(arKeys)#" index="i">			
				<cfif ListFind("NAME,FUNCTIONS",arKeys[i])>
					<cfset tempVal = coldfire_udf_encode( md[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
					<cfset ArrayAppend(jsonString, '"' & arKeys[i] & '":' & tempVal) />
				</cfif>
			</cfloop>
			<cfreturn "{" & ArrayToList(jsonString,",") & "}" />
		</cfif>
	
	<!--- STRUCT --->
	<cfelseif IsStruct(_data)>
		<cfset jsonString = ArrayNew(1) />
		<cfset ArrayAppend(jsonString,"""__cftype__"":""struct""") />
		<cfset arKeys = StructKeyArray(_data) />
		<cfloop from="1" to="#ArrayLen(arKeys)#" index="i">			
			<cfif ListFindNoCase(ignoreStructKeys, arKeys[i]) eq 0>
				<cfset tempVal = coldfire_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
				<cfif tempVal neq "coldfire_ignore_value">
					<cfset ArrayAppend(jsonString, '"' & arKeys[i] & '":' & tempVal) />
				</cfif>
			</cfif>			
		</cfloop>				
		<cfreturn "{" & ArrayToList(jsonString,",") & "}" />		
	
	<!--- QUERY --->
	<cfelseif IsQuery(_data)>
		<!--- Add query meta data --->
		<cfif arguments.queryKeyCase EQ "lower">
			<cfset recordcountKey = "recordcount" />
			<cfset columnlistKey = "columnlist" />
			<cfset columnlist = LCase(_data.columnlist) />
			<cfset dataKey = "data" />
		<cfelse>
			<cfset recordcountKey = "RECORDCOUNT" />
			<cfset columnlistKey = "COLUMNLIST" />
			<cfset columnlist = UCase(_data.columnlist) />
			<cfset dataKey = "DATA" />
		</cfif>
		<cfset jsonString = ArrayNew(1) />
		<cfset ArrayAppend(jsonString,"""#recordcountKey#"":#_data.recordcount#,") />
		<cfset ArrayAppend(jsonString,"""#columnlistKey#"":""#columnlist#"",") />
		<cfset ArrayAppend(jsonString,"""#dataKey#"":") />
				
		<!--- Make query a structure of arrays --->
		<cfif arguments.queryFormat EQ "query">
			<cfset ArrayAppend(jsonString,"{") />
			<cfset colPos = 1 />
			
			<cfloop list="#_data.columnlist#" delimiters="," index="column">
				<cfif colPos GT 1>
					<cfset ArrayAppend(jsonString,",") />
				</cfif>
				<cfif arguments.queryKeyCase EQ "lower">
					<cfset column = LCase(column) />
				</cfif>
				<cfset ArrayAppend(jsonString,"""#column#"":[") />
				
				<cfloop from="1" to="#_data.recordcount#" index="i">
					<!--- Get cell value; recurse to get proper format depending on string/number/boolean data type --->
					<cfset tempVal = coldfire_udf_encode( _data[column][i], arguments.queryFormat, arguments.queryKeyCase ) />
					
					<cfif i GT 1>
						<cfset ArrayAppend(jsonString,",") />
					</cfif>
					<cfset ArrayAppend(jsonString,tempVal) />
				</cfloop>
				
				<cfset ArrayAppend(jsonString,"]") />
				
				<cfset colPos = colPos + 1 />
			</cfloop>
			<cfset ArrayAppend(jsonString,"}") />
		<!--- Make query an array of structures --->
		<cfelse>
			<cfset ArrayAppend(jsonString,"[") />
			<cfloop query="_data">
				<cfif CurrentRow GT 1>
					<cfset ArrayAppend(jsonString,",") />
				</cfif>
				<cfset ArrayAppend(jsonString,"{") />
				<cfset colPos = 1 />
				<cfloop list="#columnlist#" delimiters="," index="column">
					<cfset tempVal = coldfire_udf_encode( _data[column][CurrentRow], arguments.queryFormat, arguments.queryKeyCase ) />
					
					<cfif colPos GT 1>
						<cfset ArrayAppend(jsonString,",") />
					</cfif>
					
					<cfif arguments.queryKeyCase EQ "lower">
						<cfset column = LCase(column) />
					</cfif>
					<cfset ArrayAppend(jsonString,"""#column#"":#tempVal#") />
					
					<cfset colPos = colPos + 1 />
				</cfloop>
				<cfset ArrayAppend(jsonString,"}") />
			</cfloop>
			<cfset ArrayAppend(jsonString,"]") />
		</cfif>
		
		<!--- Wrap all query data into an object --->
		<cfreturn "{" & ArrayToList(jsonString,"") & "}" />
		
	<!--- XML DOC --->
	<cfelseif IsXMLDoc(_data)>
		<cfset jsonString = ArrayNew(1) />
		<cfset ArrayAppend(jsonString,"""__cftype__"":""xmldoc""") />
		<cfset arKeys = ListToArray("XmlComment,XmlRoot") />
		<cfloop from="1" to="#ArrayLen(arKeys)#" index="i">			
			<cfif ListFindNoCase(ignoreStructKeys, arKeys[i]) eq 0>
				<cfset tempVal = coldfire_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
				<cfif tempVal neq "coldfire_ignore_value">
					<cfset ArrayAppend(jsonString, '"' & arKeys[i] & '":' & tempVal) />
				</cfif>
			</cfif>			
		</cfloop>				
		<cfreturn "{" & ArrayToList(jsonString,",") & "}" />
	
	<!--- XML ELEMENT --->
	<cfelseif IsXmlElem(_data)>
		<cfset jsonString = ArrayNew(1) />
		<cfset ArrayAppend(jsonString,"""__cftype__"":""xmlelem""") />
		<cfset arKeys = ListToArray("XmlName,XmlNsPrefix,XmlNsURI,XmlText,XmlComment,XmlAttributes,XmlChildren") />
		<cfloop from="1" to="#ArrayLen(arKeys)#" index="i">			
			<cfif ListFindNoCase(ignoreStructKeys, arKeys[i]) eq 0>
				<cfset tempVal = coldfire_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
				<cfif tempVal neq "coldfire_ignore_value">
					<cfset ArrayAppend(jsonString, '"' & arKeys[i] & '":' & tempVal) />
				</cfif>
			</cfif>			
		</cfloop>				
		<cfreturn "{" & ArrayToList(jsonString,",") & "}" />
		
	<!--- XML NODE --->
	<cfelseif IsXmlNode(_data)>
		<cfset jsonString = ArrayNew(1) />
		<cfset ArrayAppend(jsonString,"""__cftype__"":""xmlnode""") />
		<cfset arKeys = ListToArray("XmlName,XmlType,XmlValue") />
		<cfloop from="1" to="#ArrayLen(arKeys)#" index="i">			
			<cfif ListFindNoCase(ignoreStructKeys, arKeys[i]) eq 0>
				<cfset tempVal = coldfire_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
				<cfif tempVal neq "coldfire_ignore_value">
					<cfset ArrayAppend(jsonString, '"' & arKeys[i] & '":' & tempVal) />
				</cfif>
			</cfif>			
		</cfloop>				
		<cfreturn "{" & ArrayToList(jsonString,",") & "}" />
	
	<!--- UNKNOWN OBJECT TYPE --->
	<cfelse>
		<cfreturn "{""__cftype__"":""unknown""}" />	
	</cfif>
</cffunction>



<!--- TODO: Isn't there a Java method to make this quicker? --->
<cffunction 
	name="coldfire_udf_sizeSplit" 
	output="false" 
	hint="Splits a string into an array of N chars">
	
	<cfargument name="string" type="string" required="true">
	<cfargument name="size" type="numeric" required="true">
	
	<cfset var result = arrayNew(1)>
	
	<cfif len(arguments.string) lt arguments.size>
		<cfset result[1] = arguments.string>
		<cfreturn result>
	</cfif>

	<cfloop condition="len(arguments.string) gt arguments.size">
		<cfset arrayAppend(result, left(arguments.string, arguments.size))>
		<cfset arguments.string = right(arguments.string, len(arguments.string)-arguments.size)>
	</cfloop>
	<cfif len(arguments.string)>
		<cfset arrayAppend(result,arguments.string)>
	</cfif>	

	<cfreturn result>	
</cffunction>




<cffunction
	name="coldfire_udf_ucase_first"
	output="false"
	hint="Makes first letter upper case">
	
	<cfargument name="str" type="string" required="true">
	
	<cfset var size = Len(str)>
	<cfif size eq 0>
		<cfreturn str>
	<cfelseif size eq 1>
		<cfreturn UCase(str)>
	<cfelse>msg
		<cfreturn UCase(mid(str,1,1)) & Mid(str,2,size)>
	</cfif>
</cffunction>
