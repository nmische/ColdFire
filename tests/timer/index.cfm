<cfoutput>
<html>
<head>
	<title>ColdFire Timer Test</title>
</head>
<body>
<h1>ColdFire Timer Test</h1>
<p>This page generates six timer messages.</p>
</body>
</html>
</cfoutput>


<cftimer label="Timer One" type="debug">
<cfset sleep(3) />
</cftimer>

<cftimer label="Timer Two" type="debug">
<cfset sleep(7) />
</cftimer>

<cftimer label="Timer Three" type="debug">
<cfset sleep(14) />
</cftimer>

<cftimer label="Timer Four" type="debug">
<cfset sleep(15) />
</cftimer>

<cftimer label="Timer Five" type="debug">
<cfset sleep(22) />
</cftimer>

<cftimer label="Timer Six" type="debug">
<cfset sleep(41) />
</cftimer>