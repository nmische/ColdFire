<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Array Test</title>
</head>
<body>
<h1>Array Test</h1>

<cfset testVar = ["item one","item two","item three"] />

<pre>
<code>
&lt;cfset testVar = ["item one","item two","item three"] /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>