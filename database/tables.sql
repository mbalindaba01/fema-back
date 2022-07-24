create table users(user_id serial primary key, full_name varchar, email varchar unique, password varchar);
create table facilities(facility_id serial primary key, name varchar, location varchar, reg varchar, capacity int, contact varchar, email varchar unique, password varchar);
create table service_config(config_id serial primary key, service_name varchar, service_description varchar);