create table if not exists users (
  id bigserial primary key,
  name varchar(20) not null,
  password varchar(255) not null
);

create table if not exists game_infos (
  id bigserial primary key,
  date date not null,
  player varchar(50) not null,
  result varchar(10) not null,
  score integer not null
);
