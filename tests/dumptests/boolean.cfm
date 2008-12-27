<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Boolean Test</title>
</head>
<body>
<h1>Boolean Test</h1>

<cfset testVar = true />

<pre>
<code>
&lt;cfset testVar = true /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

<cfset testVar = "yes" />

<pre>
<code>
&lt;cfset testVar = "yes" /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

<cfset testVar = 1 />

<pre>
<code>
&lt;cfset testVar = 1 /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

<cfset testVar = "true" />

<pre>
<code>
&lt;cfset testVar = "true" /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>