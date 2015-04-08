CREATE TABLE user_types (
	type varchar(31),
	PRIMARY KEY (type)
);


CREATE TABLE users (
	id MEDIUMINT NOT NULL AUTO_INCREMENT,
	login VARCHAR(60) NOT NULL,
	pw varchar(255) NOT NULL,
	user_type VARCHAR(31) NOT NULL,

	PRIMARY KEY (id)
);


ALTER TABLE users ADD CONSTRAINT FKuser_type FOREIGN KEY (user_type) REFERENCES user_types(type);
