<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>

<cfform>
    Last Name:<br />
    <cfinput type="text" name="lastName"
        autosuggest="cfc:suggestcfc.getLNames({cfautosuggestvalue})"><br />
    <br />
    First Name:<br />
    <cfinput type="text" name="firstName"
        autosuggest="cfc:suggestcfc.getFNames({cfautosuggestvalue},{lastName})">
</cfform>
</body>
</html>
