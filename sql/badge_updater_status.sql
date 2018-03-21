CREATE TABLE badge_updater_status (
    last_run timestamp with time zone
);

COPY badge_updater_status (last_run) FROM stdin;
2000-01-01 00:00:00.000000-08
\.
