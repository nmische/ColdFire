<cfcomponent displayname="Test Component" hint="This is a test component." output="false">

	<cfproperty name="testProp" displayname="Test Prop" hint="This is a test property" type="string" default="Hello" />

	<cffunction name="getTestProp" access="public" output="false" returntype="string">
		<cfreturn testProp />
	</cffunction>

	<cffunction name="setTestProp" access="public" output="false" returntype="void">
		<cfargument name="testProp" type="string" required="true" />
		<cfset testProp = arguments.testProp />
		<cfreturn />
	</cffunction>

	<cffunction name="testFunction" displayname="testFunction" hint="This is a test function" access="public" output="false" returntype="string">
		<!--- TODO: Implement Method --->
		<cfreturn "testFunction" />
	</cffunction>
</cfcomponent>