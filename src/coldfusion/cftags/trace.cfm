<cfif thisTag.executionMode eq "end">

	<cfparam name="attributes.inline" type="boolean" default="false">
	<cfparam name="attributes.abort" type="boolean" default="false">

	<!--- if we are using coldfire and tracing a variable, use enhanced coldfire tracing --->
	<cfif 
		IsDebugMode()
		and StructKeyExists(attributes,"var")
		and not attributes.inline
		and not attributes.abort
		and StructKeyExists(GetHttpRequestData().headers,"User-Agent")
		and FindNoCase("ColdFire",GetHttpRequestData().headers["User-Agent"]) gt 0>
					
		<cfif not StructKeyExists(request,"__coldFireTraceValues__")>			
			<cfset factory = CreateObject("java","coldfusion.server.ServiceFactory")>
			<cfset cfdebugger = factory.getDebuggingService()>
			<cfset request.__coldFireTraceValues__ = cfdebugger.getDebugger().getData()>
			<cfset request.__coldFireTraceStartTime__ = GetTickCount()>
		</cfif>
		
		<cfset QueryAddRow(request.__coldFireTraceValues__) />
		
		<!--- type --->
		<cfset QuerySetCell(request.__coldFireTraceValues__,"type","Trace") />
		
		<!--- message --->
		<cfset QuerySetCell(request.__coldFireTraceValues__,"message",attributes.var & " = ") />
		
		<!--- endTime --->
		<cfset QuerySetCell(request.__coldFireTraceValues__,"endTime",GetTickCount() - request.__coldFireTraceStartTime__) />
				
		<!--- priority --->
		<cfif StructKeyExists(attributes, "type")>
			<cfset QuerySetCell(request.__coldFireTraceValues__,"priority",attributes.type) />
		<cfelse>
			<cfset QuerySetCell(request.__coldFireTraceValues__,"priority","Information") />
		</cfif>
		
		<!--- category --->
		<cfif StructKeyExists(attributes, "category")>
			<cfset QuerySetCell(request.__coldFireTraceValues__,"category",attributes.category) />
		</cfif>
		
		<!--- result --->
		<cfif IsDefined("caller.#attributes.var#")>
			<cftry>
				<cfset QuerySetCell(request.__coldFireTraceValues__,"result",coldfire_trace_udf_encode(caller[attributes.var])) />
				<cfcatch></cfcatch>
			</cftry>
		<cfelse>
			<cfset QuerySetCell(request.__coldFireTraceValues__,"result","undefined") />
		</cfif>
		
		<cffunction 
			name="coldfire_trace_udf_encode" 
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
			
			<cfset var ignoreStructKeys = "_CF_HTMLASSEMBLER,__COLDFIREVARIABLEVALUES__">
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
					<cfset tempVal = coldfire_trace_udf_encode( _data[i], arguments.queryFormat, arguments.queryKeyCase ) />
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
						<cfset tempVal = coldfire_trace_udf_encode( md[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
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
				<cfreturn "{""__cftype__"":""wddx"",""data"":" & coldfire_trace_udf_encode( tempVal, arguments.queryFormat, arguments.queryKeyCase ) & "}" />
				
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
		
						<cfset tempVal = coldfire_trace_udf_encode( methodArray, arguments.queryFormat, arguments.queryKeyCase ) />
						
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
						
						<cfset tempVal = coldfire_trace_udf_encode( fieldArray, arguments.queryFormat, arguments.queryKeyCase ) />
						
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
							<cfset tempVal = coldfire_trace_udf_encode( md[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
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
						<cfset tempVal = coldfire_trace_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
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
							<cfset tempVal = coldfire_trace_udf_encode( _data[column][i], arguments.queryFormat, arguments.queryKeyCase ) />
							
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
							<cfset tempVal = coldfire_trace_udf_encode( _data[column][CurrentRow], arguments.queryFormat, arguments.queryKeyCase ) />
							
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
						<cfset tempVal = coldfire_trace_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
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
						<cfset tempVal = coldfire_trace_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
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
						<cfset tempVal = coldfire_trace_udf_encode( _data[ arKeys[i] ], arguments.queryFormat, arguments.queryKeyCase ) />
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
	
	<!--- else use the built in version --->
	<cfelse>
		<cfinclude template="trace_adobe.cfm">
	</cfif>


</cfif>