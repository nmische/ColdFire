<cfcomponent displayname="ColdFire Base Application CFC">
	
	<cffunction name="onRequestEnd" returntype="void">		
		<cfif IsDefined("onRequest")>
			<cfset copyColdFireVariables() />
		</cfif>	
	</cffunction>
	
	<cffunction name="copyColdFireVariables" returntype="void" output="no" access="private" hint="Copies variables scoped variables defined in the ColdFire variables tab to the request scope so they are available to the coldfire.cfm debugging template.">
		<cfset var varArray = [] />
		<cfset var requestData = GetHttpRequestData() />
		<cfset var i = 0 />
		
		<cfif structKeyExists(requestData.headers,"x-coldfire-variables")>
			<cfset varArray = DeserializeJSON(requestData.headers["x-coldfire-variables"]) />
			<cfset request.__coldFireVariableValues__ = {} />
		</cfif>
		
		<cfloop array="#varArray#" index="varName">
			<cfif CompareNoCase(Left(varName,10),"variables.") eq 0
				OR (Find(".",varName) eq 0 AND ListFindNoCase("application,cgi,client,cookie,form,request,server,url",varName) eq 0)>
				<cfif IsDefined(varName)>
					<cfset request.__coldFireVariableValues__[varName] = evaluate(varName) />
				</cfif>
			</cfif>		
		</cfloop>	
	
	</cffunction>
	
</cfcomponent>