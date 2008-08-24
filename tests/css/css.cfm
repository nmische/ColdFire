<cfquery name="getClassNames" datasource="cfartgallery">
SELECT DISTINCT
	SUBSTR(LASTNAME,1,1) AS ClassName
FROM
	ARTISTS
ORDER BY
	1
</cfquery>

<cfcontent type="text/css" reset="true">

<cffunction name="randomColor" returntype="string" output="false">
	<cfset red = RJustify(FormatBaseN(RandRange(0,256),16),2) />
	<cfset green = RJustify(FormatBaseN(RandRange(0,256),16),2) />
	<cfset blue = RJustify(FormatBaseN(RandRange(0,256),16),2) />
	<cfreturn Replace("##" & red & green & blue, " ", "0", "ALL") />	
</cffunction>


<cfoutput query="getClassNames">
.#ClassName# {
	color: #randomColor()#;
}
</cfoutput>

<cftrace text="Hello from css.cfm!">

