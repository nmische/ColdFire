SET NAMES latin1;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `UserTypes` (
  `UserTypeID` int(11) NOT NULL auto_increment,
  `UserType` varchar(20) NOT NULL,
  PRIMARY KEY  (`UserTypeID`),
  KEY `UserTypeID` (`UserTypeID`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

insert into `UserTypes` values('1','Passenger'),
 ('2','Other');

SET FOREIGN_KEY_CHECKS = 1;
