<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Binary Test</title>
</head>
<body>
<h1>Binary Test</h1>

<cfset testVar = CharsetDecode("This is a test.","utf-8") />

<pre>
<code>
&lt;cfset testVar = CharsetDecode("This is a test.","utf-8") /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>