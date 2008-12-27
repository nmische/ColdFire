<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Date Test</title>
</head>
<body>
<h1>Date Test</h1>

<cfset testVar = Now() />

<pre>
<code>
&lt;cfset testVar = Now() /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>