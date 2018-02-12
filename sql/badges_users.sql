CREATE TABLE badges_users (
    user_id integer,
    badge_id integer,
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY(user_id, badge_id)
);
