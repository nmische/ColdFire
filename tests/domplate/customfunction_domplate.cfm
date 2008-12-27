<cfinclude template="../../src/coldfusion/coldfire.cfm"/>
<cffunction name="testVar" returntype="string" roles="someRole" access="public" description="This is a test description" output="false" displayname="TestVarFunction" hint="This is a hint">
	
	<cfargument name="message" type="string" required="true"/>
	<cfargument name="messagePrefix" type="string" required="false" default=""/>	
	<cfreturn arguments.messagePrefix & " " & arguments.message />
	
</cffunction>
<cfset testJSON = coldfire_udf_encode(testVar) />
<cfoutput>
<html>
<head>
	<title>Custom Function Test</title>
	
	<script src="debug.js" type="text/javascript"></script>
	<script src="domplate.js" type="text/javascript"></script>
	<script src="lib.js" type="text/javascript"></script>
	
	<script>	
	
		function runTest(){
			
			with (FBL){		
				var testVar = #testJSON#;			
				ColdFireFormatter.dump.append({value:testVar}, $("test"));
			}
		
		};
					
		window.addEventListener("load", runTest, false);				

	</script>	
	
	<link rel="stylesheet" type="text/css" href="dump.css" />
</head>
<body>
<h1>Custom Function Test</h1>

<h2>DOMPLATE</h2>

<div id="test"></div>

</body>
</html>
</cfoutput>