<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Struct Test</title>
</head>
<body>
<h1>Struct Test</h1>

<cfset testVar = {keyone="item one", keytwo="item two", keythree="item three"} />

<pre>
<code>
&lt;cfset testVar = {keyone="item one", keytwo="item two", keythree="item three"} /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>