<html>
    <head>
        <title>ColdFire ORM Test</title>
    </head>
    <body>
        <h1>ColdFire ORM Test</h1>
        
        
        <cfoutput>
        <ul>
        <cfloop array="#EntityLoad('User')#" index="user">
            <li>#user.getFirstName()# #user.getFirstName()#, #user.getUserType().getUserType()#</li>
        </cfloop>
        </ul>
        </cfoutput>

        <cfinclude template="include.cfm" />
             
   
    </body>
</html>




