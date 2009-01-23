<cfoutput>
<html>
<head>
	<title>Domplate Tests</title>
	
	<script type="text/javascript">
		function loadTests(type) {
			parent.dump.location=type+"_dump.cfm";
			parent.domplate.location=type+"_domplate.cfm";			
		}
	</script>
</head>
<body>
<h1>Domplate Tests</h1>
<ul>
	<li><a href="##" onclick="loadTests('array')">Array</a></li>
	<li><a href="##" onclick="loadTests('binary')">Binary</a></li>
	<li><a href="##" onclick="loadTests('boolean')">Boolean</a></li>
	<li><a href="##" onclick="loadTests('customfunction')">Custom Function</a></li>
	<li><a href="##" onclick="loadTests('date')">Date</a></li>
	<li><a href="##" onclick="loadTests('numeric')">Numeric</a></li>
	<li><a href="##" onclick="loadTests('object')">Object</a></li>
	<li><a href="##" onclick="loadTests('query')">Query</a></li>
	<li><a href="##" onclick="loadTests('string')">String</a></li>
	<li><a href="##" onclick="loadTests('struct')">Struct</a></li>
	<li><a href="##" onclick="loadTests('wddx')">WDDX</a></li>
	<li><a href="##" onclick="loadTests('xml')">XML</a></li>
</ul>

<p><small><b>Note:</b> you cannot use coldfire debugging with these tests. Either disable debugging or use classic.cfm.</small></p>
</body>
</html>
</cfoutput>