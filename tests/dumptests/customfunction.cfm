<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Custom Function Test</title>
</head>
<body>
<h1>Custom Function Test</h1>

<cffunction name="testVar" returntype="string" roles="someRole" access="public" description="This is a test description" output="false" displayname="TestVarFunction" hint="This is a hint">
	<cfargument name="message" type="string" required="true"/>
	<cfargument name="messagePrefix" type="string" required="false" default=""/>	
	<cfreturn arguments.messagePrefix & " " & arguments.message />
</cffunction>

<pre>
<code>
&lt;cffunction name="testVar" returntype="string" roles="someRole" access="public" description="This is a test description" output="false" displayname="TestVarFunction" hint="This is a hint">
	&lt;cfargument name="message" type="string" required="true"/>
	&lt;cfargument name="messagePrefix" type="string" required="false" default=""/>	
	&lt;cfreturn arguments.messagePrefix & " " & arguments.message />
&lt;/cffunction&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>