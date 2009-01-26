<cfcomponent output="false">
	
	<cfset this.name="ColdFireAJAXTests" />
		
	<cffunction name="onApplicationStart" returnType="boolean">
		
		<cfset var coldspringConfig = "#ExpandPath('.')#/coldspring.xml" />  
		<cfset application.beanFactory = CreateObject("component", "coldspring.beans.DefaultXmlBeanFactory").init() />  
		<cfset application.beanFactory.loadBeans(coldspringConfig) /> 
		
   		<cfreturn true />
	</cffunction>
	
	<cffunction name="onRequestStart" returnType="boolean">
   		<cfargument type="String" name="targetPage" required="true" />
		
		<cfif StructKeyExists(url,"reset")>
			<cfset onApplicationStart() />
		</cfif>   

   		<cfreturn true />
	</cffunction>

</cfcomponent>