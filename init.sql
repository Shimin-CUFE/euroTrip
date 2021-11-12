-- CREATE DATABASE eurodb;
USE eurodb;

DROP TABLE IF EXISTS City;
CREATE TABLE City(
	city_id INT PRIMARY KEY,
	city_name VARCHAR(20) NOT NULL,
	city_price INT NOT NULL,
	city_url VARCHAR(40) NOT NULL
);

DROP TABLE IF EXISTS Route;
CREATE TABLE Route(
	route_id INT PRIMARY KEY,
	route_city1 INT NOT NULL,
	route_city2 INT NOT NULL,
	route_distance INT NOT NULL,
	route_type VARCHAR(20) NOT NULL,
	route_start INT NOT NULL,
	route_finish INT NOT NULL,
	route_fee INT NOT NULL,
	FOREIGN KEY(route_city1) REFERENCES City(city_id),
	FOREIGN KEY(route_city2) REFERENCES City(city_id)
);

DROP TABLE IF EXISTS Scenery;
CREATE TABLE Scenery(
	scenery_id INT PRIMARY KEY,
	scenery_city INT NOT NULL,
	scenery_name VARCHAR(20) NOT NULL,
	scenery_url VARCHAR(40) NOT NULL,
	FOREIGN KEY(scenery_city) REFERENCES City(city_id)
);

DROP TABLE IF EXISTS User;
CREATE TABLE User(
	user_id INT PRIMARY KEY,
	user_name VARCHAR(20) NOT NULL,
	user_pwd VARCHAR(40) NOT NULL
);
