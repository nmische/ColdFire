<cfinclude template="../../src/coldfusion/coldfire.cfm"/>
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
<!--- <cfset testVar3 = XmlSearch(testVar, '//@active') /> --->
<cfset testVar3 = XmlSearch(testVar, '/users//user/name/text()') />
<cfset testJSON = coldfire_udf_encode(testVar) />
<cfset testJSON2 = coldfire_udf_encode(testVar2) />
<cfset testJSON3 = coldfire_udf_encode(testVar3) />
<cfoutput>
<html>
<head>
	<title>XML Test</title>
	
	<script src="debug.js" type="text/javascript"></script>
	<script src="domplate.js" type="text/javascript"></script>
	<script src="lib.js" type="text/javascript"></script>
	<script src="dump.js" type="text/javascript"></script >
	
	<script>	
	
		function runTest(){
			
			with (FBL){		
				var testVar = #testJSON#;
				var testVar2 = #testJSON2#;
				var testVar3 = #testJSON3#;			
				ColdFireFormatter.dump.append({value:testVar}, $("test"));
				//ColdFireFormatter.dump.append({value:testVar2}, $("test2"));
				//ColdFireFormatter.dump.append({value:testVar3}, $("test3"));
			}
		
		};
					
		window.addEventListener("load", runTest, false);				

	</script>	
	
	<link rel="stylesheet" type="text/css" href="dump.css" />
</head>
<body>
<h1>XML Test</h1>

<h2>DOMPLATE</h2>

<div id="test"></div>

<div id="test2"></div>

<div id="test3"></div>

</body>
</html>
</cfoutput>