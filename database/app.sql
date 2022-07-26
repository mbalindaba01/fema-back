
create table users (
    user_id serial not null primary key,
    full_name varchar not null,
    email varchar not null,
    password varchar not null
);

create table facilities (
    facility_id serial not null primary key,
    facility_name varchar not null,
    facility_location varchar not null,
    facility_reg varchar not null,
    facility_capacity int,
    facility_contacno varchar not null,
    facility_email varchar not null,
    password varchar not null
);

create table service_config (
    serv_config_id serial not null primary key,
    name varchar unique not null,
    description varchar not null
);

create table bookings (
    booking_id serial not null primary key,
    user_ref int not null,
    foreign key (user_ref) references users(user_id),
    facility_ref int not null,
    foreign key (facility_ref) references facilities(facility_id),
    service_id int not null,
    foreign key (service_id) references service_config(serv_config_id),
    booking_date date not null,
    booking_time time not null,
    booking_status varchar
);

create table services(
    service_id serial not null primary key, 
    facility_ref int, 
    foreign key (facility_ref) references facilities(facility_id),
    serv_config_ref int, 
    foreign key (serv_config_ref) references service_config(serv_config_id)
);
