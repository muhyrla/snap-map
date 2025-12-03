CREATE TABLE IF NOT EXISTS verification_status (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   task_id TEXT NOT NULL UNIQUE,
   state TEXT NOT NULL,
   user_id BIGINT NOT NULL,
   object_key TEXT NOT NULL,
   message TEXT,
   updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_result (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   task_id TEXT NOT NULL UNIQUE,
   result_json JSONB NOT NULL,
   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
