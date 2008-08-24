<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Numeric Test</title>
</head>
<body>
<h1>Numeric Test</h1>

<cfset testVar = 1234 />

<pre>
<code>
&lt;cfset testVar = 1234 /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

<cfset testVar = 1234.123 />

<pre>
<code>
&lt;cfset testVar = 1234.123 /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>