<html>
<head>
<script src="javascript/Spry_1_6_1_022408/includes/SpryData.js" language="javascript" type="text/javascript"></script>
<script src="javascript/Spry_1_6_1_022408/includes/SpryJSONDataSet.js" language="javascript" type="text/javascript"></script>
<script src="javascript/Spry_1_6_1_022408/widgets/autosuggest/SpryAutoSuggest.js"language="JavaScript" type="text/javascript"></script>
<link href="javascript/Spry_1_6_1_022408/widgets/autosuggest/SpryAutoSuggest.css" rel="stylesheet" type="text/css" />
<script language="JavaScript" type="text/javascript">
  var ds1 = new Spry.Data.JSONDataSet("spryJSONArtists.cfm");
</script>
</head>
<body>
<div id="mySuggest">
<input type="text" name="product"/>
  <div id="resultsDIV" spry:region="ds1">
    <ul>
      <li spry:repeat="ds1" spry:suggest="{column0}">{column0}</li>
    </ul>
  </div>
</div>
<script type="text/javascript">
	var theSuggest = new Spry.Widget.AutoSuggest("mySuggest","resultsDIV", "ds1","column0",{loadFromServer: true, urlParam: "nm"});
</script>

</body>
</html>