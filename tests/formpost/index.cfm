<html>
<head>
	<title>ColdFire Tests</title>
</head>
<body>
<h1>Form Post Test</h1>

<form action="action.cfm" method="POST">
	<fieldset>
		<legend>Post To Action</legend>
		<input type="text" name="textInput">
		<input type="hidden" name="hiddenInput" value="Test hidden field.">
		<input type="submit">
	</fieldset>
</form>

<form action="redirect.cfm" method="POST">
	<fieldset>
		<legend>Post To Redirect</legend>
		<input type="text" name="textInput">
		<input type="hidden" name="hiddenInput" value="Test hidden field.">
		<input type="submit">
	</fieldset>
</form>

</body>
</html>