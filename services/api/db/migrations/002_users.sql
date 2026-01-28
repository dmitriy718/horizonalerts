create table if not exists users (
  uid text primary key,
  email text not null unique,
  first_name text,
  last_name text,
  age int,
  zip_code text,
  street_address text,
  city text,
  state text,
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
