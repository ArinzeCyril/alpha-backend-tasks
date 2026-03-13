CREATE TABLE briefings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    analyst_name VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    is_generated BOOLEAN DEFAULT FALSE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE briefing_points (
    id SERIAL PRIMARY KEY,
    briefing_id INTEGER NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    point_type VARCHAR(50) NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL
);

CREATE TABLE briefing_metrics (
    id SERIAL PRIMARY KEY,
    briefing_id INTEGER NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL
);

CREATE INDEX idx_briefing_points_briefing_id ON briefing_points(briefing_id);
CREATE INDEX idx_briefing_metrics_briefing_id ON briefing_metrics(briefing_id);
