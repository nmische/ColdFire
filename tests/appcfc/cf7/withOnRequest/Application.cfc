<cfcomponent extends="coldfire.src.coldfusion.appcfc.cf7.Application">
	
	<cfset this.name = "ColdFireExample" />
	<cfset this.clientManagement = "true" />
	<cfset this.sessionManagement = "true" />
	
	<cffunction name="onRequest" returnType="void">
   		<cfargument name="targetPage" type="String" required="true" />   			
		<cfinclude template="#arguments.targetPage#" />  
	</cffunction>
	
</cfcomponent>