SET NAMES latin1;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `Users` (
  `UserID` int(11) NOT NULL auto_increment,
  `FirstName` varchar(50) default NULL,
  `LastName` varchar(50) default NULL,
  `Active` bit(1) default NULL,
  `UserTypeID` int(11) default NULL,
  PRIMARY KEY  (`UserID`),
  KEY `UserTypeID` (`UserTypeID`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

insert into `Users` values('1','Kate','Austen',b'00000001','1'),
 ('2','Boone','Carlyle',b'00000000','1'),
 ('3','Ana Lucia','Cortez',b'00000000','1'),
 ('4','Michael','Dawson',b'00000000','1'),
 ('5','James','Ford',b'00000001','1'),
 ('6','Sayid','Jarrah',b'00000001','1'),
 ('7','Jin-Soo','Kwon',b'00000001','1'),
 ('8','Sun-Hwa','Kwon',b'00000001','1'),
 ('9','Claire','Littleton',b'00000001','1'),
 ('10','Walt','Lloyd',b'00000000','1'),
 ('11','John','Locke',b'00000001','1'),
 ('12','Charlie','Pace',b'00000001','1'),
 ('13','Hugo','Reyes',b'00000001','1'),
 ('14','Shannon','Rutherford',b'00000000','1'),
 ('15','Jack','Shephard',b'00000001','1'),
 ('16','Ben','Linus',b'00000001','2'),
 ('17','Richard','Alpert',b'00000001','2'),
 ('18','Danny','Pickett',b'00000000','2'),
 ('19','Ethan','Rom',b'00000000','2'),
 ('20','Goodwin','Stanhope',b'00000000','2'),
 ('21','Juliet','Burke',b'00000001','2');

SET FOREIGN_KEY_CHECKS = 1;
