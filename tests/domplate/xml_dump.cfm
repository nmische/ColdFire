<cfxml variable="testVar">
<users>
	<user id="1" active="false">
		<name>Nathan</name>
	</user>
	<user id="2" active="true">
		<name>Barbara</name>
	</user>
</users>
</cfxml>
<cfset testVar2 = testVar.users />
<cfset testVar3 = XmlSearch(testVar, '//@active') />

<cfoutput>
<html>
<head>
	<title>XML Test</title>
</head>
<body>
<h1>XML Test</h1>

<h2>CFDUMP</h2>

<cfdump var="#testVar#">

<cfdump var="#testVar2#">

<cfdump var="#testVar3#">

</body>
</html>
</cfoutput>