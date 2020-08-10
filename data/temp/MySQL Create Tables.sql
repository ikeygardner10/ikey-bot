CREATE DATABASE `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;



CREATE DATABASE `CREATE TABLE `chokecount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `fuckcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `handholdcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `highfivecount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `hugcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `kisscount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `patcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `punchcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `shootcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `slapcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `spankcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

CREATE DATABASE `CREATE TABLE `stabcount` (
  `userID` bigint NOT NULL,
  `memberID` bigint NOT NULL,
  `messageCount` int NOT NULL,
  PRIMARY KEY (`userID`,`memberID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;



CREATE TABLE `disabledchannels` (
  `guildID` bigint NOT NULL,
  `channelID` varchar(21) NOT NULL,
  PRIMARY KEY (`guildID`,`channelID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `guilds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guildID` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `joined` tinyint(1) NOT NULL,
  `ownerID` varchar(18) NOT NULL,
  `ownerName` varchar(32) NOT NULL,
  `members` int NOT NULL,
  `region` varchar(20) NOT NULL,
  `createdAt` varchar(100) NOT NULL,
  PRIMARY KEY (`guildID`),
  UNIQUE KEY `guildID_UNIQUE` (`guildID`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `guildsettings` (
  `guildID` bigint NOT NULL,
  `prefix` varchar(1) NOT NULL DEFAULT '$',
  `maxFamilySize` int NOT NULL DEFAULT '250',
  `allowIncest` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`guildID`),
  UNIQUE KEY `guildID_UNIQUE` (`guildID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tag` varchar(30) NOT NULL,
  `content` varchar(1950) DEFAULT NULL,
  `imageURL` varchar(500) DEFAULT NULL,
  `userID` varchar(18) NOT NULL,
  `guildID` varchar(18) DEFAULT NULL,
  `guildCreated` varchar(18) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `imageURL_UNIQUE` (`imageURL`)
) ENGINE=InnoDB AUTO_INCREMENT=1051 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
