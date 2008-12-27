<cffunction name="testVar" returntype="string" roles="someRole" access="public" description="This is a test description" output="false" displayname="TestVarFunction" hint="This is a hint">
	
	<cfargument name="message" type="string" required="true"/>
	<cfargument name="messagePrefix" type="string" required="false" default=""/>	
	<cfreturn arguments.messagePrefix & " " & arguments.message />
	
</cffunction>

<cfoutput>
<html>
<head>
	<title>Custom Function Test</title>
</head>
<body>
<h1>Custom Function Test</h1>

<h2>CFDUMP</h2>

<cfdump var="#testVar#">

</body>
</html>
</cfoutput>