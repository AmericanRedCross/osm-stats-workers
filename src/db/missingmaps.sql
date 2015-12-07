-- ==========================================
-- ==========================================
-- Define tables ============================
-- ==========================================

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: osmuser
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE osmuser;

CREATE TABLE osmuser
(
  id integer NOT NULL,
  name text,
  avatar text,
  geo_extent text,
  date_created timestamp with time zone,
  CONSTRAINT osmuser_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE osmuser
  OWNER TO postgres;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: badge
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE badge;

CREATE TABLE badge
(
  id serial NOT NULL,
  name text,
  description text,
  requirements text,
  date_created timestamp with time zone,
  date_modified timestamp with time zone,
  CONSTRAINT badge_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE badge
  OWNER TO postgres;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: osmuser_badge
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE osmuser_badge;

CREATE TABLE osmuser_badge
(
  id serial NOT NULL,
  osmuser_id integer,
  badge_id integer,
  date_created timestamp with time zone,
  CONSTRAINT osmuser_badge_pkey PRIMARY KEY (id),
  CONSTRAINT osmuser_badge_id_fkey FOREIGN KEY (badge_id)
      REFERENCES badge (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT osmuser_badge_osmuser_id_fkey FOREIGN KEY (osmuser_id)
      REFERENCES osmuser (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE RESTRICT
)
WITH (
  OIDS=FALSE
);
ALTER TABLE osmuser_badge
  OWNER TO postgres;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: changeset
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE changeset;

CREATE TABLE changeset
(
  id integer NOT NULL,
  road_count integer,
  building_count integer,
  waterway_count integer,
  poi_count integer,
  gps_trace_count integer,
  road_km integer,
  waterway_km integer,
  gps_trace_km integer,
  editor text,
  osmuser_id integer,
  date_created timestamp with time zone,
  CONSTRAINT changeset_pkey PRIMARY KEY (id),
  CONSTRAINT changeset_osmuser_id_fkey FOREIGN KEY (osmuser_id)
      REFERENCES osmuser (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE RESTRICT
)
WITH (
  OIDS=FALSE
);
ALTER TABLE changeset
  OWNER TO postgres;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: hashtag
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE hashtag;

CREATE TABLE hashtag
(
  id serial NOT NULL,
  hashtag text,
  date_created timestamp with time zone,
  CONSTRAINT hashtag_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE hashtag
  OWNER TO postgres;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: changeset_hashtag
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE changeset_hashtag;

CREATE TABLE changeset_hashtag
(
  id serial NOT NULL,
  changeset_id integer,
  hashtag_id integer,
  date_created timestamp with time zone,
  CONSTRAINT changeset_hashtag_pkey PRIMARY KEY (id),
  CONSTRAINT changeset_hashtag_changeset_id_fkey FOREIGN KEY (changeset_id)
      REFERENCES changeset (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT changeset_hashtag_hashtag_id_fkey FOREIGN KEY (hashtag_id)
      REFERENCES hashtag (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE changeset_hashtag
  OWNER TO postgres;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: country
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE country;

CREATE TABLE country
(
  id serial NOT NULL,
  name text,
  date_created timestamp with time zone,
  CONSTRAINT country_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE country
  OWNER TO postgres;

-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- Table: changeset_country
-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
-- DROP TABLE changeset_country;

CREATE TABLE changeset_country
(
  id serial NOT NULL,
  changeset_id integer,
  country_id integer,
  date_created timestamp with time zone,
  CONSTRAINT changeset_country_pkey PRIMARY KEY (id),
  CONSTRAINT changeset_country_changeset_id_fkey FOREIGN KEY (changeset_id)
      REFERENCES changeset (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT changeset_country_id_fkey FOREIGN KEY (country_id)
      REFERENCES country (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE RESTRICT
)
WITH (
  OIDS=FALSE
);
ALTER TABLE changeset_country
  OWNER TO postgres;

