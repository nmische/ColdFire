SET NAMES latin1;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `Users` (
  `UserID` int(11) NOT NULL auto_increment,
  `FirstName` varchar(50) default NULL,
  `LastName` varchar(50) default NULL,
  `Active` bit(1) default NULL,
  `UserTypeID` int(11) default NULL,
  `UserCode` char(3) default NULL,
  PRIMARY KEY  (`UserID`),
  KEY `UserTypeID` (`UserTypeID`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

insert into `Users` values('1','Kate','Austen',b'00000001','1','SUR'),
 ('2','Boone','Carlyle',b'00000000','1','SUR'),
 ('3','Ana Lucia','Cortez',b'00000000','1','SUR'),
 ('4','Michael','Dawson',b'00000000','1','SUR'),
 ('5','James','Ford',b'00000001','1','SUR'),
 ('6','Sayid','Jarrah',b'00000001','1','SUR'),
 ('7','Jin-Soo','Kwon',b'00000001','1','SUR'),
 ('8','Sun-Hwa','Kwon',b'00000001','1','SUR'),
 ('9','Claire','Littleton',b'00000001','1','SUR'),
 ('10','Walt','Lloyd',b'00000000','1','SUR'),
 ('11','John','Locke',b'00000001','1','SUR'),
 ('12','Charlie','Pace',b'00000001','1','SUR'),
 ('13','Hugo','Reyes',b'00000001','1','SUR'),
 ('14','Shannon','Rutherford',b'00000000','1','SUR'),
 ('15','Jack','Shephard',b'00000001','1','SUR'),
 ('16','Ben','Linus',b'00000001','2','OTH'),
 ('17','Richard','Alpert',b'00000001','2','OTH'),
 ('18','Danny','Pickett',b'00000000','2','OTH'),
 ('19','Ethan','Rom',b'00000000','2','OTH'),
 ('20','Goodwin','Stanhope',b'00000000','2','OTH'),
 ('21','Juliet','Burke',b'00000001','2','OTH');

SET FOREIGN_KEY_CHECKS = 1;
