<cfinclude template="udfDecisionTest.cfm"/>
<cfoutput>
<html>
<head>
	<title>Query Test</title>
</head>
<body>
<h1>Query Test</h1>

<cfquery name="testVar" datasource="cfartgallery">
	SELECT LASTNAME
	FROM   ARTISTS
</cfquery>

<pre>
<code>
&lt;cfquery name="testVar" datasource="cfartgallery"&gt;
	SELECT LASTNAME
	FROM   ARTISTS
&lt;/cfquery&gt;
</code>
</pre>

<br/>

<cfdump var="#testVar#">

<br/>

#decisionTest(testVar)#

</body>
</html>
</cfoutput>