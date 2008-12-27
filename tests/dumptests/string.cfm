<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>String Test</title>
</head>
<body>
<h1>String Test</h1>

<cfset testVar = "Hello" />

<pre>
<code>
&lt;cfset testVar = "Hello" /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>