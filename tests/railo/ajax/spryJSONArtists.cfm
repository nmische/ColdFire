<cfparam name="url.nm" default="">
<cfquery name="getUsers" datasource="coldfiretest">
SELECT
	LastName
FROM
	Users
WHERE
	1=0
	<cfif url.nm neq "">
	OR LastName LIKE '#url.nm#%'
	</cfif>
</cfquery>
<cfset delim = "">
<cfset date = DateFormat(Now(), 'ddd, dd mmm yyyy')>
<cfset time = TimeFormat(Now(), 'long')>
<cfset DATA_RFC822 = date & time>

<cftrace text="Hello from spryJSONArtists.cfm!">

<cfheader name="Content-Type" value="text/javascript">
<cfheader name="Last-Modified" value="#DATA_RFC822#">
<cfheader name="Pragma" value="no-cache">
<cfheader name="Cache-Control" value="no-cache, must-revalidate">
<cfheader name="Expires" value="#DATA_RFC822#">

<cftimer label="Generate JSON" type="debug"> 
<cfoutput>
[
<cfloop query="getUsers">
#delim#"#LASTNAME#"
<cfset delim = ",">
</cfloop>
]
</cfoutput>
</cftimer>