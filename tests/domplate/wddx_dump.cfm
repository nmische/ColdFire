<cfset testVarWDDX = ["item one","item two","item three"] />
<cfwddx action="cfml2wddx" input="#testVarWDDX#" output="testVar" />
<cfoutput>
<html>
<head>
	<title>WDDX Test</title>
</head>
<body>
<h1>WDDX Test</h1>

<h2>CFDUMP</h2>

<cfdump var="#testVar#">

</body>
</html>
</cfoutput>