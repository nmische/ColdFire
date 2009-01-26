<html xmlns="http://www.w3.org/1999/xhtml">
<head>
</head>
<body>

<cfform>
    Last Name:<br />
    <cfinput type="text" name="lastName"
        autosuggest="url:suggestcfm.cfm?lookup=lastName&suggestvalue={cfautosuggestvalue}"><br />
    <br />
    First Name:<br />
    <cfinput type="text" name="firstName"
        autosuggest="url:suggestcfm.cfm?lookup=firstName&suggestvalue={cfautosuggestvalue}&lastName={lastName}">
</cfform>
</body>
</html>
