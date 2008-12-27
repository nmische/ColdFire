<cfcomponent extends="coldfire.src.coldfusion.appcfc.cf8.Application">
	
	<cfset this.name = "ColdFireExample" />
	<cfset this.clientManagement = "true" />
	<cfset this.sessionManagement = "true" />
	
	<cffunction name="onRequestStart" returnType="boolean">
   		<cfargument name="targetPage" type="String" required="true" /> 	
		<cftrace text="onRequestStart" /> 
		<cfreturn true />
	</cffunction>
	
	<cffunction name="onRequestEnd" returnType="void">
 		<cftrace text="onRequestEnd" /> 
	</cffunction>
	
</cfcomponent>