-- ============================================
-- CREATE TABLES FOR PARTNERLOOKING BACKEND
-- ============================================

-- Usuarios Table
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  universidad VARCHAR(255),
  sobre_mi TEXT,
  calificacion_promedio DECIMAL(3, 2) DEFAULT 0,
  total_resenas INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  rol VARCHAR(50) DEFAULT 'STUDENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publicaciones (Listings) Table
CREATE TABLE IF NOT EXISTS publicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_publicacion VARCHAR(50) NOT NULL,
  tipo_espacio VARCHAR(50),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  direccion VARCHAR(255),
  ciudad VARCHAR(100),
  colonia VARCHAR(100),
  precio DECIMAL(10, 2),
  disponible_desde DATE,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  amenidades JSONB,
  permite_mascotas BOOLEAN DEFAULT FALSE,
  permite_fumar BOOLEAN DEFAULT FALSE,
  estado VARCHAR(50) DEFAULT 'ACTIVA',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verificaciones (Validations) Table
CREATE TABLE IF NOT EXISTS verificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  url_documento VARCHAR(1024) NOT NULL,
  estado VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favoritos (Favorites) Table
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  publicacion_id UUID NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, publicacion_id)
);

-- Resenas (Reviews) Table
CREATE TABLE IF NOT EXISTS resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id_evaluado UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_id_evaluador UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id_evaluado, usuario_id_evaluador)
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_publicaciones_usuario_id ON publicaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_ciudad ON publicaciones(ciudad);
CREATE INDEX IF NOT EXISTS idx_publicaciones_coordenadas ON publicaciones(latitud, longitud);
CREATE INDEX IF NOT EXISTS idx_verificaciones_usuario_id ON verificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario_id ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_publicacion_id ON favoritos(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_resenas_usuario_id_evaluado ON resenas(usuario_id_evaluado);
CREATE INDEX IF NOT EXISTS idx_resenas_usuario_id_evaluador ON resenas(usuario_id_evaluador);
