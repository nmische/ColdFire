DELIMITER $$

DROP PROCEDURE IF EXISTS GetUsers$$
CREATE PROCEDURE GetUsers (
		fnfilter VARCHAR(10),
		lnfilter VARCHAR(10),
		afilter BIT
)
BEGIN
	SELECT 
		* 
	FROM 
		Users
	WHERE
		1=1
		AND (FirstName LIKE CONCAT(fnfilter, '%') OR fnfilter IS NULL)
		AND (FirstName LIKE CONCAT(lnfilter, '%') OR lnfilter IS NULL)
		AND (FirstName LIKE CONCAT(afilter, '%') OR afilter IS NULL);
END$$

DELIMITER ;

/* 
Be sure to run the following to give the user permission to run the procedure.
GRANT SELECT ON `mysql`.`proc` TO 'username'@'host'; 
*/