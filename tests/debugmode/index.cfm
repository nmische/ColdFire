<html>
<head>
	<title>ColdFire Tests</title>
</head>
<body>
<h1>Debugging Mode Tests</h1>

<form action="cfsetting.cfm" method="POST">
	<fieldset>
		<legend>CFSETTING</legend>
		<input type="submit">
	</fieldset>
</form>

<form action="tester.cfm?_cf_nodebug=true" method="POST">
	<fieldset>
		<legend>_cf_nodebug URL PARAM</legend>
		<input type="submit">
	</fieldset>
</form>

<form action="tester.cfm" method="POST">
	<fieldset>
		<legend>_cf_nodebug FORM FIELD</legend>
		<input type="hidden" name="_cf_nodebug" value="true">
		<input type="submit">
	</fieldset>
</form>

<form action="tester.cfm?_cf_nodebug=true" method="POST">
	<fieldset>
		<legend>_cf_nodebug FORM FIELD FALSE AND URL PARAM TRUE</legend>
		<input type="hidden" name="_cf_nodebug" value="false">
		<input type="submit">
	</fieldset>
</form>

<form action="tester.cfm?_cf_nodebug=false" method="POST">
	<fieldset>
		<legend>_cf_nodebug FORM FIELD TRUE AND URL PARAM FALSE</legend>
		<input type="hidden" name="_cf_nodebug" value="true">
		<input type="submit">
	</fieldset>
</form>



</body>
</html>