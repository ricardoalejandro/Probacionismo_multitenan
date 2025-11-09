-- Create course_topics table
CREATE TABLE IF NOT EXISTS course_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_course_order UNIQUE(course_id, order_index)
);

-- Create indexes for performance
CREATE INDEX idx_course_topics_course_id ON course_topics(course_id);
CREATE INDEX idx_course_topics_order ON course_topics(course_id, order_index);

-- Add comment
COMMENT ON TABLE course_topics IS 'Temas/contenidos de los cursos con título y descripción';
