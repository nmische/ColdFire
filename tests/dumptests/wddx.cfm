<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>WDDX Test</title>
</head>
<body>
<h1>WDDX Test</h1>

<cfset testVarWDDX = ["item one","item two","item three"] />
<cfwddx action="cfml2wddx" input="#testVarWDDX#" output="testVar" />

<pre>
<code>
&lt;cfset testVarWDDX = ["item one","item two","item three"] /&gt;
&lt;cfwddx action="cfml2wddx" input="testVarWDDX" output="testVar" /&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>