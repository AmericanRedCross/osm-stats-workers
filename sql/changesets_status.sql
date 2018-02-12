CREATE TABLE changesets_status (
    id integer,
    updated_at timestamp with time zone
);

COPY changesets_status (id, updated_at) FROM stdin;
2729010	2018-01-24 18:00:20.72487-08
\.
