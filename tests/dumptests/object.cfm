<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Object Test</title>
</head>
<body>
<h1>Object Test</h1>

<cfset testVar = CreateObject("component","TestComponent") />

<pre>
<code>
&lt;cfset testVar = CreateObject("component","TestComponent") /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

<cfset testVar = CreateObject("java","java.lang.String") />

<pre>
<code>
&lt;cfset testVar = CreateObject("java","java.lang.String") /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>