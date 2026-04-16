-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: gestion_employes
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `affectations_projets`
--

DROP TABLE IF EXISTS `affectations_projets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affectations_projets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projet_id` int NOT NULL,
  `employe_id` int NOT NULL,
  `role_projet` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `projet_id` (`projet_id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `affectations_projets_ibfk_1` FOREIGN KEY (`projet_id`) REFERENCES `projets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `affectations_projets_ibfk_2` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affectations_projets`
--

LOCK TABLES `affectations_projets` WRITE;
/*!40000 ALTER TABLE `affectations_projets` DISABLE KEYS */;
/*!40000 ALTER TABLE `affectations_projets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conges`
--

DROP TABLE IF EXISTS `conges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `type_conge` enum('annuel','maladie','maternite','paternite','sans_solde') NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `jours_demandes` int NOT NULL,
  `statut` enum('en_attente','approuve','rejete') DEFAULT 'en_attente',
  `motif` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `conges_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conges`
--

LOCK TABLES `conges` WRITE;
/*!40000 ALTER TABLE `conges` DISABLE KEYS */;
INSERT INTO `conges` VALUES (1,7,'maladie','2026-04-07','2026-04-09',3,'approuve','teste','2026-04-07 05:10:07'),(2,7,'annuel','2026-04-10','2026-04-28',19,'rejete','testette','2026-04-07 05:15:56');
/*!40000 ALTER TABLE `conges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expediteur_id` int NOT NULL,
  `destinaire_id` int DEFAULT NULL,
  `dernier_message_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_group` tinyint(1) DEFAULT '0',
  `group_name` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `expediteur_id` (`expediteur_id`),
  KEY `destinaire_id` (`destinaire_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`expediteur_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`destinaire_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (4,1,NULL,'2026-04-07 04:53:55','2026-04-03 11:45:03',1,'Tous les employés'),(5,7,5,'2026-04-07 05:06:17','2026-04-07 05:06:12',0,NULL),(6,1,5,'2026-04-07 06:50:14','2026-04-07 06:50:08',0,NULL);
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations_participants`
--

DROP TABLE IF EXISTS `conversations_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `employe_id` int NOT NULL,
  `is_mentioned` tinyint(1) DEFAULT '0',
  `mentioned_by` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participant` (`conversation_id`,`employe_id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `conversations_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_participants_ibfk_2` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations_participants`
--

LOCK TABLES `conversations_participants` WRITE;
/*!40000 ALTER TABLE `conversations_participants` DISABLE KEYS */;
INSERT INTO `conversations_participants` VALUES (8,4,1,0,NULL,1,'2026-04-03 11:45:08'),(12,4,5,0,1,1,'2026-04-03 11:45:08'),(13,5,7,0,NULL,1,'2026-04-07 05:06:13'),(14,5,5,0,NULL,1,'2026-04-07 05:06:13'),(15,6,1,0,NULL,1,'2026-04-07 06:50:08'),(16,6,5,0,NULL,1,'2026-04-07 06:50:08');
/*!40000 ALTER TABLE `conversations_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employe_photos`
--

DROP TABLE IF EXISTS `employe_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employe_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `photo_profil_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  KEY `photo_profil_id` (`photo_profil_id`),
  CONSTRAINT `employe_photos_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employe_photos_ibfk_2` FOREIGN KEY (`photo_profil_id`) REFERENCES `photos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employe_photos`
--

LOCK TABLES `employe_photos` WRITE;
/*!40000 ALTER TABLE `employe_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `employe_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employes`
--

DROP TABLE IF EXISTS `employes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(20) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `poste` varchar(100) DEFAULT NULL,
  `departement` varchar(100) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `adresse` text,
  `date_embauche` date DEFAULT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `role` enum('employe','admin','rh') DEFAULT 'employe',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `photo` text,
  `date_naissance` date DEFAULT NULL,
  `categorie` varchar(10) DEFAULT NULL,
  `cin` varchar(50) DEFAULT NULL,
  `num_cnaps` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employes`
--

LOCK TABLES `employes` WRITE;
/*!40000 ALTER TABLE `employes` DISABLE KEYS */;
INSERT INTO `employes` VALUES (1,'ARIS-0001','RAHARISON','Michaël','michael@aris-cc.com','$2b$12$Yhztso4UB14qt6H1Bb1JsOOKaPZ9L.hg7zyqxvehhE4vki56lMwDS','GERANT','Gérant','038 53 405 34','Lot II B 128 TER Mahalavolona Andoharanofotsy 102','2023-12-05','actif','admin','2026-04-03 10:36:40',NULL,'1994-11-10','HC','101.211.216.824','941110005606'),(5,'ARIS-0005','RAHANTARIMALALA','Mamisoa Felicia','mamisoa@aris-cc.com','$2b$12$1PbI8BvPRpesLvHKZC3VROr4OHwcBJ3Sg3Qyvm7hes0Xc.zJm/sW2','TECHNICIEN ASSISTANT','Assistant Technique','034 02 213 54','III F 138 Antohomadinika Afovoany Antananarivo I','2024-04-12','actif','employe','2026-04-03 10:36:40','/photos/emp_5.png','1993-10-02','2B','101.211.214.901','931002005967'),(6,'ARIS-0007','ANDRIANARISOA','Lalarimina Tahiry','tahiry@aris-cc.com','$2b$12$G9ct9A7lfcAh0ohJudfrouZl2U9MNKYjcbSUH8VtnT4v1DqtaChM6','MANAGER CALL','Manager Google Maps','032 52 771 41','IC 189 TER D ANKADILALAMPOTSY ANKARAOBATO','2024-08-19','actif','employe','2026-04-03 13:14:32',NULL,'1995-09-16','HC','101.252.184.456','952916002009'),(7,'ARIS-0008','FANOMEZANTSOA','Maminiaina Sarobidy','sarobidy@aris-cc.com','$2b$12$3B8yWsTfYiA89wC5r7WCZu3q8XDYqIQzhVKFlSkR9iISKwk9J0H4a','TECHNICIEN RESEAU','Technicien réseau','033 34 755 64','LOT IC 110 TER A ANKADILALAMPOTSY ANKARAOBATO','2025-07-01','actif','employe','2026-04-03 13:14:32','/photos/emp_7.jpeg','2002-12-12','2B','117.191.018.397','021212002606'),(8,'ARIS-0012','RAZANATSIMBA','Brigitte','brigitterazanatsimba@aris-cc.com','$2b$12$mdhbwjgo/gMiPVzLqGHHgeBPkE9Qx6FnngPIc1MvFjR7LgnuniyOu','TELEOPERATEUR','Ebay','034 95 432 10','II T 29 Ambohibao Iavoloha Bongatsara','2025-05-01','actif','employe','2026-04-03 13:14:32',NULL,'1980-08-08','2B','117.392.002.118','802808003871'),(9,'ARIS-0010','RASOAMBOLAMANANA','Aimée Eliane','aimée eliane.rasoambolamanana@aris-cc.com','$2b$12$J0HsooRItKgKhD9rdllaV.8wyxPs5xpS6Of94UAr0SkcJOB7A/fI6','FEMME DE MENAGE','Femme de ménage','034 30 933 55','II A 299 BIS K Tanjombato Iraitsimivaky Antananarivo 102','2024-09-25','actif','employe','2026-04-03 13:19:21',NULL,'1993-06-08','2B','117.152.016.626','932608003092'),(10,'ARIS-0002','RASOANIRINA','Arlette','arlette.rasoanirina@aris-cc.com','$2b$12$Psf17rVa6GBeZTfj.U/ujeQAAD5EkWexwha4N7UgNagptEs491c/u','Sécurité','Agent de Sécurité','034 75 819 13','FA 243 TER Ambohimanatrika Mivoatra commune Tanjombato Antananarivo 102','2023-12-05','actif','employe','2026-04-07 07:00:08','/photos/emp_21.png','1977-04-21','2B','210.012.012.871','772421000797'),(11,'ARIS-0003','RANAIVOARIMANANA','Ravakinionja Jean Valérie','onja@aris-cc.com','$2b$12$lCiuIYAtDVm0Olz4fTxtjO2WngH.0Ar4QzG55cfrEm9dzVO5Mu03S','Ingénieur BTP','Ingénieur BTP','033 05 059 33','Lot TSF 505/A Antsahafohy Ambohitrimanjaka','2024-01-02','actif','employe','2026-04-07 07:00:08',NULL,'1995-02-08','HC','103.131.015.114','950208004812'),(12,'ARIS-0004','RAZAFINDRAIBE','Harimalala Vololoniaina Annie','annie@aris-cc.com','$2b$12$egFD0TI21rxXX8AjpNO0e.KLaKhxc/8GPrjcRrylr13TfCxYTxRq.','Ingénieur BTP','Ingénieur BTP','034 25 903 79','III H 105 B BIS Avaratanana Antananarivo VI','2024-02-01','actif','employe','2026-04-07 07:00:08',NULL,'1996-09-24','HC','101.982.094.987','962924004850');
/*!40000 ALTER TABLE `employes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `expediteur_id` int NOT NULL,
  `contenu` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reply_to_id` int DEFAULT NULL,
  `fichiers` text,
  `is_deleted_for_all` tinyint(1) DEFAULT '0',
  `deleted_for` text,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `expediteur_id` (`expediteur_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`expediteur_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (6,4,1,'bonjour','2026-04-03 11:48:27',NULL,'[]',0,NULL),(7,4,1,' @tout_le_monde ','2026-04-03 11:49:05',NULL,'[]',0,NULL),(8,4,5,'bonjour','2026-04-03 11:54:31',NULL,'[]',1,NULL),(10,4,7,'Bonjour','2026-04-03 13:31:11',NULL,'[]',0,NULL),(11,4,1,'Bonjour a tous','2026-04-07 04:53:55',NULL,'[]',0,NULL),(12,5,7,'de awna','2026-04-07 05:06:17',NULL,'[]',0,NULL),(13,6,1,'bonjour','2026-04-07 06:50:14',NULL,'[]',0,NULL);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages_lus`
--

DROP TABLE IF EXISTS `messages_lus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages_lus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `employe_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_read` (`message_id`,`employe_id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `messages_lus_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_lus_ibfk_2` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=204 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages_lus`
--

LOCK TABLES `messages_lus` WRITE;
/*!40000 ALTER TABLE `messages_lus` DISABLE KEYS */;
INSERT INTO `messages_lus` VALUES (15,6,5,'2026-04-03 11:49:15'),(16,7,5,'2026-04-03 11:49:15'),(37,8,1,'2026-04-03 12:25:42'),(175,10,1,'2026-04-03 13:31:28'),(188,12,5,'2026-04-07 05:06:54'),(192,10,5,'2026-04-07 05:07:04'),(193,11,5,'2026-04-07 05:07:04'),(203,13,5,'2026-04-07 06:50:28');
/*!40000 ALTER TABLE `messages_lus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `type` enum('conge_demande','conge_approuve','conge_rejete','pointage','rapport','salaire','message','system') NOT NULL,
  `titre` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `lien` varchar(255) DEFAULT NULL,
  `est_lu` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `type` enum('profil','document','rapport') DEFAULT 'profil',
  `nom_fichier` varchar(255) NOT NULL,
  `chemin` varchar(500) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `taille` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pointages`
--

DROP TABLE IF EXISTS `pointages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pointages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `date` date NOT NULL,
  `heure_arrivee` time DEFAULT NULL,
  `heure_depart` time DEFAULT NULL,
  `statut` enum('present','absent','retard','conge') DEFAULT 'present',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `pointages_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pointages`
--

LOCK TABLES `pointages` WRITE;
/*!40000 ALTER TABLE `pointages` DISABLE KEYS */;
INSERT INTO `pointages` VALUES (1,7,'2026-04-03','07:59:20',NULL,'present','2026-04-03 13:22:18'),(2,5,'2026-03-31','10:59:21',NULL,'present','2026-04-03 13:22:18'),(3,7,'2026-03-31','07:52:51','16:41:45','present','2026-04-03 13:22:18'),(4,9,'2026-03-31','10:59:32',NULL,'present','2026-04-03 13:22:18'),(5,8,'2026-03-31','16:25:27','16:26:30','present','2026-04-03 13:22:18'),(6,7,'2026-03-25','10:25:13','11:31:45','present','2026-04-03 13:22:18'),(7,7,'2026-03-24','09:22:33',NULL,'present','2026-04-03 13:22:18'),(8,7,'2026-03-23','08:40:02','16:12:16','present','2026-04-03 13:22:18'),(9,7,'2026-03-19','14:03:26','15:43:03','present','2026-04-03 13:22:18'),(10,5,'2026-03-11','09:10:06','09:28:57','present','2026-04-03 13:22:18'),(11,7,'2026-03-11','09:27:52','09:28:42','present','2026-04-03 13:22:18'),(12,9,'2026-03-11','09:42:48',NULL,'present','2026-04-03 13:22:18'),(13,8,'2026-03-11','08:02:06','08:08:46','present','2026-04-03 13:22:18'),(14,5,'2026-03-10','15:13:12','15:12:27','present','2026-04-03 13:22:18'),(15,6,'2026-03-10','15:15:42','15:16:05','present','2026-04-03 13:22:18'),(16,7,'2026-03-10','15:30:13','15:29:46','present','2026-04-03 13:22:18'),(17,9,'2026-03-10','15:15:20','09:50:51','present','2026-04-03 13:22:18'),(18,8,'2026-03-10','14:07:14','15:03:58','present','2026-04-03 13:22:18'),(19,5,'2026-03-09','12:56:39','13:37:31','present','2026-04-03 13:22:18'),(20,6,'2026-03-09','10:49:57','10:49:54','present','2026-04-03 13:22:18'),(21,7,'2026-03-09','13:39:05','13:38:24','present','2026-04-03 13:22:18'),(22,9,'2026-03-09','15:19:50',NULL,'present','2026-04-03 13:22:18'),(23,8,'2026-03-09','07:42:31','15:04:36','present','2026-04-03 13:22:18'),(24,5,'2026-03-02','13:08:46','13:48:32','present','2026-04-03 13:22:18'),(25,6,'2026-03-02','13:07:52',NULL,'present','2026-04-03 13:22:18'),(26,7,'2026-04-07','08:45:45',NULL,'present','2026-04-07 05:49:03'),(27,6,'2026-04-06','08:57:24',NULL,'present','2026-04-07 05:57:31'),(33,6,'2026-04-07','08:57:24',NULL,'present','2026-04-07 06:03:27'),(34,8,'2026-04-07','09:05:46',NULL,'present','2026-04-07 06:06:14'),(35,7,'2026-04-02','08:03:34','14:37:26','present','2026-04-07 06:23:59'),(36,5,'2026-04-01','08:46:46',NULL,'present','2026-04-07 06:23:59'),(37,7,'2026-04-01','07:57:06','16:40:09','present','2026-04-07 06:23:59'),(38,1,'2026-03-31','20:56:44',NULL,'present','2026-04-07 06:23:59'),(39,5,'2026-03-30','11:47:21',NULL,'present','2026-04-07 06:24:00'),(40,7,'2026-03-30','09:13:10','13:34:19','present','2026-04-07 06:24:00'),(41,1,'2026-03-27','08:52:12','08:52:58','present','2026-04-07 06:24:00'),(42,5,'2026-03-27','14:16:26',NULL,'present','2026-04-07 06:24:00'),(43,6,'2026-03-27','14:16:54',NULL,'present','2026-04-07 06:24:00'),(44,7,'2026-03-27','14:26:49','14:15:34','present','2026-04-07 06:24:00'),(45,9,'2026-03-27','09:59:45','09:59:45','present','2026-04-07 06:24:00'),(46,8,'2026-03-27','09:57:52','09:57:53','present','2026-04-07 06:24:00'),(47,7,'2026-03-26','08:32:58','16:44:44','present','2026-04-07 06:24:01'),(48,9,'2026-04-07','09:27:21',NULL,'present','2026-04-07 06:27:27');
/*!40000 ALTER TABLE `pointages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projets`
--

DROP TABLE IF EXISTS `projets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) NOT NULL,
  `description` text,
  `statut` enum('en_cours','termine','en_attente','annule') DEFAULT 'en_cours',
  `date_debut` date DEFAULT NULL,
  `date_fin_prevue` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projets`
--

LOCK TABLES `projets` WRITE;
/*!40000 ALTER TABLE `projets` DISABLE KEYS */;
/*!40000 ALTER TABLE `projets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rapports`
--

DROP TABLE IF EXISTS `rapports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rapports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `titre` varchar(200) NOT NULL,
  `contenu` text,
  `type` enum('quotidien','hebdomadaire','mensuel') NOT NULL,
  `date_rapport` date NOT NULL,
  `statut` enum('brouillon','soumis','approuve','rejete') DEFAULT 'brouillon',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `rapports_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rapports`
--

LOCK TABLES `rapports` WRITE;
/*!40000 ALTER TABLE `rapports` DISABLE KEYS */;
/*!40000 ALTER TABLE `rapports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reactions`
--

DROP TABLE IF EXISTS `reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message_id` int NOT NULL,
  `employe_id` int NOT NULL,
  `emoji` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  KEY `idx_message_reaction` (`message_id`,`employe_id`,`emoji`),
  CONSTRAINT `reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reactions_ibfk_2` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reactions`
--

LOCK TABLES `reactions` WRITE;
/*!40000 ALTER TABLE `reactions` DISABLE KEYS */;
INSERT INTO `reactions` VALUES (2,11,7,'❤️','2026-04-07 04:54:26'),(3,12,5,'😢','2026-04-07 05:07:00');
/*!40000 ALTER TABLE `reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salaries`
--

DROP TABLE IF EXISTS `salaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `mois` int NOT NULL,
  `annee` int NOT NULL,
  `salaire_base` decimal(10,2) NOT NULL,
  `primes` decimal(10,2) DEFAULT '0.00',
  `deductions` decimal(10,2) DEFAULT '0.00',
  `salaire_net` decimal(10,2) NOT NULL,
  `statut_paiement` enum('en_attente','paye') DEFAULT 'en_attente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salaries`
--

LOCK TABLES `salaries` WRITE;
/*!40000 ALTER TABLE `salaries` DISABLE KEYS */;
INSERT INTO `salaries` VALUES (1,1,1,2026,1500000.00,0.00,0.00,1500000.00,'paye','2026-04-03 13:22:48'),(2,5,1,2026,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(3,6,1,2026,1500000.00,0.00,0.00,1500000.00,'paye','2026-04-03 13:22:48'),(4,7,1,2026,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(5,9,1,2026,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(6,8,1,2026,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(7,1,3,2025,1500000.00,0.00,0.00,1500000.00,'paye','2026-04-03 13:22:48'),(8,5,3,2025,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(9,6,3,2025,1500000.00,0.00,0.00,1500000.00,'paye','2026-04-03 13:22:48'),(10,7,3,2025,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(11,9,3,2025,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(12,8,3,2025,800000.00,0.00,0.00,800000.00,'paye','2026-04-03 13:22:48'),(13,6,4,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(14,7,4,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(15,5,4,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(16,1,4,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(17,9,4,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(18,8,4,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(19,6,3,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(20,7,3,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(21,5,3,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(22,9,3,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(23,8,3,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48'),(24,1,3,2026,0.00,0.00,0.00,0.00,'paye','2026-04-03 13:22:48');
/*!40000 ALTER TABLE `salaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employe_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `employe_id` (`employe_id`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (108,1,'aris_i3h4lmt79fmnobfps1','2026-04-08 10:46:41','2026-04-07 07:46:41');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-07 10:57:12
