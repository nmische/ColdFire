component {
    this.name = "ColdFireORM"; 
    this.ormEnabled = "true"; 
    this.ormSettings.datasource = "coldfiretest"; 
    this.ormsettings.searchenabled = "true"; 
    this.ormSettings.search.autoindex = "true"; 
    this.ormSettings.logSQL = "true"; 

    function onRequestStart() {
        if (structKeyExists(url,'ormreload')) {
            ORMReload();
        }
    }
}
