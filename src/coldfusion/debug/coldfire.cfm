<!---
	Name:			coldfire.cfm
	Author:			Raymond Camden
	Created:		2/15/07
	Last Updated:	9/21/2007
	History:		Added isFlushInitiated from Ben Nadel (http://www.bennadel.com/blog/317-Checking-To-See-If-CFFlush-Has-Already-Been-Executed.htm) (rkc 3/12/07)
					Change to how templates/CFCs are reported. Due to size issues, we now show one unique row only, like CF's classic view (rkc 3/12/07)
					getQueries was throwing an error when recordCount/newattributes didn't exist. (rkc 3/12/07)
					json functionality from Thomas Messier (thomas@epiphantastic.com)
					Split crap into N strings. This fixes the 'too big header' issue. (rkc 3/20/07)
					Made a stupid mistake in my split udf (rkc 3/21/07)
					Duplicate qEvents so it isn't a pointer. Rename all UDFs to avoid conflicts. CFTIMER support (rkc 4/4/07)
					Reput back in fix for bound parameter replacement in getQueries (rkc 4/4/07)
					Reworked getQueries to return query parameter as well as stored procedure parameter/resultset data (nmische@gmail.com 4/9/07)
					Added check for User-Agent to determine if ColdFire is enabled (nmische@gmail.com 6/28/07)
					Work to support variables (ray@camdenfamily.com, plus mods by nmiche@gmail.com 7/26/07)
					Additional work to support variables (nmische@gmail.com 9/7/2007)
					Even more work to support variables (nmische@gmail.com 9/21/2007)
					Fixes to coldfire_udf_encode based on CFJSON (nmische@gmail.com 1/2/2008)
					Change coldfire_udf_getGeneral to return query object (nmische@gmail.com 2/2/2008)
					Added check for cf_revision, added coldfire_udf_error (nmische@gmail.com 3/12/2008)
					Removed restriction on cflocation, added ignore keys for trace support (nmische@gmail.com 11/14/2008)
					
					
Handles server side debugging for ColdFire
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

<!--- Set to true if you would like to fall back to classic.cfm --->
<cfelseif false>
	<cfinclude template="classic.cfm" />

<!--- Set to true if you would like to fall back to dockable.cfm --->
<cfelseif false>
	<cfinclude template="dockable.cfm" />
	
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
		
	<cfargument name="data" type="query" required="true">

	<cfset var first_result = "">
	<cfset var result = queryNew("cfc,method,et,timestamp,template,starttime")>
	<cfset var cfc = "">
	<cfset var method = "">
	<cfset var realtemplate = "">
	<cfset var template_copy = "">
	<cfset var realmethod = "">
	<cfset var realbody = "">
	
	<cfquery dbType="query" name="first_result" debug="false">
		select template, (endTime - startTime) as et, [timestamp]
		from data
		where type = 'Template'
		
		and template like 'CFC[[ %'
		escape '['

		group by template, [timestamp], startTime, endTime

	</cfquery>

	<cfloop query="first_result">
		<cfset queryAddRow(result)>
		<cfset querySetCell(result, "et", et)>
		<cfset querySetCell(result, "timestamp", timestamp)>
		<cfset querySetCell(result, "starttime", starttime)>
		<!--- A CFC template looks like so:
			   CFC[ C:\web\testingzone\Application.cfc | onRequestStart(/testingzone/test.cfm) ] from C:\web\testingzone\Application.cfc
			It contains the CFC, the method signature, and the template 
		--->
		<cfset cfc = trim(listFirst(template,"|"))>
		<cfset cfc = replaceNoCase(cfc, "CFC[ ", "")>
		<cfset querySetCell(result, "cfc", cfc)>
		<!--- hide complex value. this is a bit of a hack. --->
		<cfset template_copy = replaceNoCase(template, "([complex value])", "(COMPLEX VALUE)")>
		<!---
		<cfset method = trim(listLast(listFirst(template_copy, "]"),"|"))>
		--->
		<cfset method = rereplace(template, "(CFC\[ .+? \| )((.*)\(.*\)) ].*", "\2")>
		<cfset method = trim(method)>
		<!--- Our methods can be REALLY freaking huge, like in MG. Let's do a sanity check. --->

		<cfif find("(", method)>
			<cfset realmethod = left(method, find("(", method)-1)>
			<cfset realbody = replace(method, realmethod & "(", "")>
			<cfif len(realbody) gt 1>
				<cfset realbody = left(realbody, len(realbody) - 1)>
				<!---
				<cfset method = realmethod & " RAAAAAAAAAAAY" & realbody & "DEBUG: #template#">
				--->
				<cfset realbody = htmlEditFormat(realbody)>
				<cfif len(realbody) gt 250>
					<cfset realbody = left(realbody, 250) & " ...">
					<cfset method = realmethod & "(" & realbody & ")">
				</cfif>
			</cfif>
		</cfif>

		<cfset querySetCell(result, "method",method)>
		<cfset realtemplate	= reReplace(template, "CFC\[(.*)?\] from ", "")>
		<cfset realtemplate = realtemplate & "." & method>
		<cfset querySetCell(result, "template", realtemplate)>
		
	</cfloop>

	<!--- now group it down a bit --->
	<cfquery name="result" dbtype="query" debug="false">
	select	sum(et) as totaltime, avg(et) as avgtime, count(template) as totalinstances, cfc, method
	from	result
	group by cfc, method
	</cfquery>

	<!--- lastly - re remove template --->
	<cfquery name="result" dbtype="query" debug="false">
	select totaltime, avgtime, totalinstances, cfc, method
	from   result
	</cfquery>
	
	<cfreturn result>	
</cffunction>




<cffunction 
	name="coldfire_udf_getChildTemplates"
	returntype="query"
	output="false" 
	hint="Gets includes, custom tags.">
		
	<cfargument name="data" type="query" required="true">

	<cfreturn coldfire_udf_getFiles(data, false)>
</cffunction>




<cffunction 
	name="coldfire_udf_getExceptions"
	returntype="query"
	output="false" 
	hint="Gets includes, custom tags.">
		
	<cfargument name="data" type="query" required="true">

	<cfset var result = queryNew("timestamp,name,template,line,message")>
	<cfset var tmp = "">
	
	<cfquery dbType="query" name="tmp" debug="false">
		SELECT *
		FROM data
		WHERE type = 'Exception'
	</cfquery>
	
	<cfloop query="tmp">
		<cfset queryAddRow(result)>
		<cfset querySetCell(result,"timestamp",tmp.timestamp)>
		<cfset querySetCell(result,"name",tmp.name)>
		<cfset querySetCell(result,"template",tmp.template)>
		<cfset querySetCell(result,"line",tmp.line)>
		<cfset querySetCell(result,"message",tmp.message)>
	</cfloop>
	
	<cfreturn result>
	
</cffunction>




<cffunction 
	name="coldfire_udf_getFiles"
	returntype="query" 
	output="false" 
	hint="Gets files from the debugging info. Used by two other UDFs to get file based info.">
	
	<cfargument name="data" type="query" required="true">
	<cfargument name="templates" type="boolean" required="false" default="true" hint="If true, we only get top level templates. If false, we get includes/tags">
				
	<cfset var result = queryNew("")>

	<cfquery dbType="query" name="result" debug="false">
		select template, sum(endTime - startTime) as totaltime, count(template) as totalinstances, avg(endTime-startTime) as avgtime
		from data
		where type = 'Template'

		<cfif arguments.templates>
		and	(
			parent = ''
			or
			parent like '%\Application.cfc'
			or
			parent like '%\Application.cfm'
			)
		<cfelse>
		and (
			parent != ''
			and
			parent not like '%\Application.cfc'
			and
			parent not like '%\Application.cfm'
		)
		</cfif>
		
		and template not like 'CFC[[ %'
		escape '['

		and template not like 'CFIDE\\%'

		group by template

	</cfquery>

	<cfreturn result>	
</cffunction>	




<cffunction 
	name="coldfire_udf_getGeneral"
	returntype="query"
	output="false"
	hint="Gets General info">
	
	<cfargument name="data" type="query" required="true">
	
	<cfset var result = queryNew("label,value")>
	<cfset var myapp = "">
	<cfset var totaltime = 0>
	<cfset var cfdebug_execution = "">
	
	<cfif isDefined("application.applicationname")>
		<cfset myapp = application.applicationName>
	</cfif>
		
	<!--- Taken from classic.cfm --->
	<!--- Total Execution Time of all top level pages --->
	<cfquery dbType="query" name="cfdebug_execution" debug="false">
	   	select (endTime - startTime) AS executionTime
	   	from data
	   	where type = 'ExecutionTime'
	</cfquery>
	
	<cfif cfdebug_execution.recordcount>
		<cfset totaltime = cfdebug_execution.executiontime>
	<cfelse>
		<cfset totaltime = -1>
	</cfif>		
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "ColdFusionServer")>
	<cfset querySetCell(result, "value", "#server.coldfusion.productname# #server.coldfusion.productlevel# #server.coldfusion.productversion#")>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Template")>
	<cfset querySetCell(result, "value", cgi.script_name)>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Timestamp")>
	<cfset querySetCell(result, "value", dateFormat(now(), "short") & " " & timeFormat(now(), "short"))>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "Locale")>
	<cfset querySetCell(result, "value", getLocale())>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "UserAgent")>
	<cfset querySetCell(result, "value", cgi.http_user_agent)>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "RemoteIP")>
	<cfset querySetCell(result, "value", cgi.remote_addr)>
	
	<cfset queryAddRow(result)>
	<cfset querySetCell(result, "label", "RemoteHost")>
	<cfset querySetCell(result, "value", cgi.remote_host)>
	
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
		
	<cfargument name="data" type="query" required="true">
	
	<cfset var result = queryNew("datasource, queryname, et, sql, parameters, resultsets, recordsreturned, type, cachedquery, template, timestamp")>	
	<cfset var coldfire_queries = "">
	<cfset var coldfire_storedproc = "">		
	<cfset var x = "">
	<cfset var q = "">
	<cfset var sql = "">
	<cfset var attr = "">
	<cfset var rslt = "">
	<cfset var parameters = "">
	<cfset var resultsets = "">	
	<cfset var recordcount = 0>	
	<cfset var cfsqltypes = "cf_sql_bigint,cf_sql_binary,cf_sql_bit,cf_sql_blob,cf_sql_decimal,cf_sql_double,cf_sql_float,cf_sql_integer,cf_sql_longvarbinary,cf_sql_money,cf_sql_numeric,cf_sql_real,cf_sql_smallint,cf_sql_tinyint,cf_sql_varbinary">
	<cfset cfsqltypes = cfsqltypes & ",cf_sql_date,cf_sql_time,cf_sql_timestamp">
	<cfset cfsqltypes = cfsqltypes & ",cf_sql_char,cf_sql_clob,cf_sql_idstamp,cf_sql_longvarchar,cf_sql_varchar">
	
	<!--- Process SQL queries --->
	<cftry>
		<cfquery dbType="query" name="coldfire_queries" debug="false">
			SELECT *, (endtime - starttime) AS executiontime
			FROM data
			WHERE type = 'SqlQuery'
		</cfquery>
		<cfscript>
			if( coldfire_queries.recordcount eq 1 and len(trim(coldfire_queries.executiontime)) )
			{
				querySetCell(coldfire_queries, "executiontime", "0", 1);
			}
		</cfscript>
		<cfcatch type="Any">
			<cfscript>
				coldfire_queries = queryNew("datasource, queryname, et, sql, parameters, resultsets, recordsreturned, type, cachedquery, template, timestamp");
			</cfscript>		
		</cfcatch>
	</cftry>
	
	<!--- Add SQL queries to the result --->
	<cfloop query="coldfire_queries">
		
		<cfset sql = coldfire_queries.body>
		<cfset parameters = "">
		<cfset resultsets = "">	
		<cfset recordcount = 0>
				
		<cfif ArrayLen(coldfire_queries.attributes[coldfire_queries.currentRow])>
			<cfset parameters = ArrayNew(1)>		
			<!--- build an array of parameter data --->
			<cfloop from="1" to="#ArrayLen(coldfire_queries.attributes[coldfire_queries.currentRow])#" index="x">
				<cfset attr = coldfire_queries.attributes[coldfire_queries.currentRow][x]>
				<cfset parameters[x] = ArrayNew(1)>
				<cfif StructKeyExists(attr,"sqltype")>
					<cfset parameters[x][1] = ListFindNoCase(cfsqltypes,attr.sqltype)>
				<cfelse>
					<cfset parameters[x][1] = "">
				</cfif>			
				<cfif StructKeyExists(attr,"value")>
					<cfset parameters[x][2] = attr.value>
				<cfelse>
					<cfset parameters[x][2] = "">
				</cfif> 
			</cfloop>
		</cfif>				
		
		<!--- Get the rowcount --->
		<cfif IsDefined("coldfire_queries.rowcount") AND IsNumeric(coldfire_queries.rowcount)>
			<cfset recordcount = Max(coldfire_queries.rowcount, 0)>
		<cfelseif IsQuery("coldfire_queries.result")>
			<cfset q = coldfire_queries.result>
			<cfset recordcount = q.recordcount>
		</cfif>
		
		<cfset QueryAddRow(result)>
		<cfset QuerySetCell(result,"datasource",coldfire_queries.datasource)>
		<cfset QuerySetCell(result,"queryname",coldfire_queries.name)>
		<cfset QuerySetCell(result,"et",coldfire_queries.executiontime)>		
		<cfset QuerySetCell(result,"sql",sql)>
		<cfset QuerySetCell(result,"parameters",parameters)>
		<cfset QuerySetCell(result,"resultsets",resultsets)>
		<cfset QuerySetCell(result,"recordsreturned",recordcount)>
		<cfset QuerySetCell(result,"type",coldfire_queries.type)>
		<cfset QuerySetCell(result,"cachedquery",coldfire_queries.cachedquery)>
		<cfset QuerySetCell(result,"template",coldfire_queries.template)>
		<cfset QuerySetCell(result,"timestamp",coldfire_queries.timestamp)>
	
	</cfloop>
	
	<!--- Process stored procedures --->
	<cftry>
		<cfquery dbType="query" name="coldfire_storedproc" debug="false">
			SELECT *, (endtime - starttime) AS executiontime
			FROM data
			WHERE type = 'StoredProcedure'
		</cfquery>
		<cfscript>
			if( coldfire_storedproc.recordcount eq 1 and len(trim(coldfire_storedproc.executiontime)) )
			{
				querySetCell(coldfire_storedproc, "executiontime", "0", 1);
			}
		</cfscript>
		<cfcatch type="Any">
			<cfscript>
				coldfire_storedproc = queryNew('datasource, queryname, et, sql, parameters, resultsets, recordsreturned, type, cachedquery, template, timestamp');
			</cfscript>						
		</cfcatch>
	</cftry>
	
	<!--- Add stored procedures to the result --->
	<cfloop query="coldfire_storedproc">
			
		<cfset sql = "">
		<cfset parameters = "">
		<cfset resultsets = "">
		<cfset recordcount = "n/a">	
		
		<cfif ArrayLen(coldfire_storedproc.attributes[coldfire_storedproc.currentRow])>
			<cfset parameters = ArrayNew(1)>		
			<!--- build an array of parameter data --->
			<cfloop from="1" to="#ArrayLen(coldfire_storedproc.attributes[coldfire_storedproc.currentRow])#" index="x">
				<cfset attr = coldfire_storedproc.attributes[coldfire_storedproc.currentRow][x]>
				<cfset parameters[x] = ArrayNew(1)>
				<cfif StructKeyExists(attr,"type")>
					<cfset parameters[x][1] = attr.type>
				<cfelse>
					<cfset parameters[x][1] = "IN">
				</cfif>	
				<cfif StructKeyExists(attr,"sqltype")>
					<cfset parameters[x][2] = ListFindNoCase(cfsqltypes,attr.sqltype)>
				<cfelse>
					<cfset parameters[x][2] = "">
				</cfif>			
				<cfif StructKeyExists(attr,"value")>
					<cfset parameters[x][3] = attr.value>
				<cfelse>
					<cfset parameters[x][3] = "">
				</cfif> 
				<cfif StructKeyExists(attr,"variable")>
					<cfset parameters[x][4] = "#attr.variable# = #coldfire_udf_CFDebugSerializable(attr.variable)#">
				<cfelse>
					<cfset parameters[x][4] = "">
				</cfif>
				<cfif StructKeyExists(attr,"dbvarname")>
					<cfset parameters[x][5] = attr.dbvarname>
				<cfelse>
					<cfset parameters[x][5] = "">
				</cfif>
				<cfif StructKeyExists(attr,"maxLength")>
					<cfset parameters[x][6] = attr.maxLength>
				<cfelse>
					<cfset parameters[x][6] = "">
				</cfif>
				<cfif StructKeyExists(attr,"scale")>
					<cfset parameters[x][7] = attr.scale>
				<cfelse>
					<cfset parameters[x][7] = "">
				</cfif>
				<cfif StructKeyExists(attr,"null")>
					<cfset parameters[x][8] = attr.null>
				<cfelse>
					<cfset parameters[x][8] = "">
				</cfif>
			</cfloop>
		</cfif>	
		
		<cfif ArrayLen(coldfire_storedproc.result[coldfire_storedproc.currentRow])>
			<cfset resultsets = ArrayNew(1)>		
			<!--- build an array of parameter data --->
			<cfloop from="1" to="#ArrayLen(coldfire_storedproc.result[coldfire_storedproc.currentRow])#" index="x">
				<cfset rslt = coldfire_storedproc.result[coldfire_storedproc.currentRow][x]>
				<cfset resultsets[x] = ArrayNew(1)>
				<cfif StructKeyExists(rslt,"name")>
					<cfset resultsets[x][1] = rslt.name>
				<cfelse>
					<cfset resultsets[x][1] = "">
				</cfif>	
				<cfif StructKeyExists(rslt,"resultSet")>
					<cfset resultsets[x][2] = rslt.resultSet>
				<cfelse>
					<cfset resultsets[x][2] = "">
				</cfif>			
			</cfloop>
		</cfif>			
				
		<cfset QueryAddRow(result)>
		<cfset QuerySetCell(result,"datasource",coldfire_storedproc.datasource)>
		<cfset QuerySetCell(result,"queryname",coldfire_storedproc.name)>
		<cfset QuerySetCell(result,"et",coldfire_storedproc.executiontime)>
		<cfset QuerySetCell(result,"sql",sql)>
		<cfset QuerySetCell(result,"parameters",parameters)>
		<cfset QuerySetCell(result,"resultsets",resultsets)>
		<cfset QuerySetCell(result,"recordsreturned",recordcount)>
		<cfset QuerySetCell(result,"type",coldfire_storedproc.type)>
		<cfset QuerySetCell(result,"cachedquery",coldfire_storedproc.cachedquery)>
		<cfset QuerySetCell(result,"template",coldfire_storedproc.template)>
		<cfset QuerySetCell(result,"timestamp",coldfire_storedproc.timestamp)>
	
	
	</cfloop>	
	
	<cfreturn result>
	
</cffunction>




<cffunction 
	name="coldfire_udf_getTemplates" 
	returtType="query"
	output="false" 
	hint="Gets templates.">
	
	<cfargument name="data" type="query" required="true">

	<cfreturn coldfire_udf_getFiles(data, true)>
</cffunction>




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




<cffunction 
	name="coldfire_udf_main" 
	returntype="void" 
	output="true"
	hint="Build and set Coldfire HTTP headers">
		
	<cfargument name="debugMode" type="boolean" required="false" default="false">
	<cfargument name="maxHeader" type="numeric" required="false" default="8000">
	
	<!--- Gets the debug data. --->
	<cfset var factory = CreateObject("java","coldfusion.server.ServiceFactory")>
	<cfset var cfdebugger = factory.getDebuggingService().getDebugger()>
	<cfset var qEvents = "">
	
	<cfset var result = StructNew()>
	<cfset var varJSON = "">
	<cfset var varArray = ArrayNew(1)>	
	<cfset var requestData = GetHttpRequestData()>
	<cfset var response = getPageContext().getResponse()>
	
			
	<cftry>
	
	<cfif not IsDefined("cfdebugger")>
		<!--- Return Error --->
		<cfset coldfire_udf_error(debugMode=false,maxHeader=8000,msg="The coldfusion debugging service does not appear to be running.")>
		<cfreturn>
	</cfif>
		
	<cfset qEvents = cfdebugger.getData()>
	 
	<cfif structKeyExists(requestData.headers,"x-coldfire-variables")>
		<cfset varJSON = requestData.headers["x-coldfire-variables"]>
		<cfset varArray = coldfire_udf_decode(varJSON)>
	</cfif>			
	
	<cfset result.general= coldfire_udf_encode(coldfire_udf_getGeneral(qEvents))>
	<cfset result.templates = coldfire_udf_encode(coldfire_udf_getTemplates(qEvents))>		
	<cfset result.ctemplates = coldfire_udf_encode(coldfire_udf_getChildTemplates(qEvents))>
	<cfset result.cfcs = coldfire_udf_encode(coldfire_udf_getCFCs(qEvents))>
	<cfset result.execeptions = coldfire_udf_encode(coldfire_udf_getExceptions(qEvents))>
	<cfset result.queries = coldfire_udf_encode(coldfire_udf_getQueries(qEvents))>
	<cfset result.trace = coldfire_udf_encode(coldfire_udf_getTrace(qEvents))>			
	<cfset result.timer = coldfire_udf_encode(coldfire_udf_getTimer(qEvents))>			
	<cfset result.variables = coldfire_udf_encode(coldfire_udf_getVariables(varArray))>

	<!--- now split into arrays --->
	<cfset result.general = coldfire_udf_sizeSplit(result.general, arguments.maxHeader)>
	<cfset result.templates = coldfire_udf_sizeSplit(result.templates, arguments.maxHeader)>
	<cfset result.ctemplates = coldfire_udf_sizeSplit(result.ctemplates, arguments.maxHeader)>
	<cfset result.cfcs = coldfire_udf_sizeSplit(result.cfcs, arguments.maxHeader)>
	<cfset result.execeptions = coldfire_udf_sizeSplit(result.execeptions, arguments.maxHeader)>
	<cfset result.queries = coldfire_udf_sizeSplit(result.queries, arguments.maxHeader)>
	<cfset result.trace = coldfire_udf_sizeSplit(result.trace, arguments.maxHeader)>
	<cfset result.timer = coldfire_udf_sizeSplit(result.timer, arguments.maxHeader)>
	<cfset result.variables = coldfire_udf_sizeSplit(result.variables, arguments.maxHeader)>


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
	<cfloop index="x" from="1" to="#arrayLen(result.execeptions)#">
		<cfheader name="x-coldfire-exceptions-#x#" value="#result.execeptions[x]#">
	</cfloop>
	<cfloop index="x" from="1" to="#arrayLen(result.queries)#">
		<cfheader name="x-coldfire-queries-#x#" value="#result.queries[x]#">
	</cfloop>
	<cfloop index="x" from="1" to="#arrayLen(result.trace)#">
		<cfheader name="x-coldfire-trace-#x#" value="#result.trace[x]#">				
	</cfloop>
	<cfloop index="x" from="1" to="#arrayLen(result.timer)#">
		<cfheader name="x-coldfire-timer-#x#" value="#result.timer[x]#">				
	</cfloop>
	<cfloop index="x" from="1" to="#arrayLen(result.variables)#">
		<cfheader name="x-coldfire-variables-#x#" value="#result.variables[x]#">				
	</cfloop>
	
	<cfcatch>
		<!--- make sure we don't throw an error --->
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




