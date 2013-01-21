component persistent="true" entityname="User" table="Users" {

  property name="userId" fieldtype="id" column="UserID" generator="native";
  property name="firstName" column="FirstName";
  property name="lastName" column="LastName";
  property name="active" column="Active";
  property name="userType" fieldtype="many-to-one" cfc="UserType" fkcolumn="UserTypeID" lazy="false";

}