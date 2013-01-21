component persistent="true" entityname="UserType" table="UserTypes" {

  property name="userTypeID" fieldtype="id" column="UserTypeID" generator="native";
  property name="userType" column="UserType";
  property name="users" fieldtype="one-to-many" cfc="User" fkcolumn="UserTypeID";

}