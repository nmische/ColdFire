<cfquery name="getArtists" datasource="cfartgallery">
SELECT
	LASTNAME
FROM
	ARTISTS
</cfquery>
<cftrace var="getArtists" />
<cflocation url="two.cfm">