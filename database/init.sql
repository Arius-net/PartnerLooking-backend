-- Crear extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de usuarios (Expandida para el Match de Roomies y Reputación)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    edad INT,
    genero VARCHAR(50),
    universidad VARCHAR(255),
    carrera VARCHAR(255),
    semestre VARCHAR(50),
    sobre_mi TEXT,
    foto_perfil TEXT,
    intereses JSONB, 
    nivel_limpieza INT CHECK (nivel_limpieza >= 1 AND nivel_limpieza <= 5),
    nivel_sociabilidad INT CHECK (nivel_sociabilidad >= 1 AND nivel_sociabilidad <= 5),
    horario VARCHAR(50), 
    presupuesto_min DECIMAL(10,2),
    presupuesto_max DECIMAL(10,2),
    fecha_mudanza DATE,
    calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_resenas INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    rol VARCHAR(20) DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de verificaciones
CREATE TABLE verificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    url_documento VARCHAR(500) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de publicaciones (Expandida para el formulario de 5 pasos)
CREATE TABLE publicaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_publicacion VARCHAR(50) NOT NULL, 
    tipo_espacio VARCHAR(50), 
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    colonia VARCHAR(100),
    precio DECIMAL(10, 2) NOT NULL,
    disponible_desde DATE,
    numero_roommates VARCHAR(50),
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    amenidades JSONB, 
    permite_mascotas BOOLEAN DEFAULT FALSE,
    permite_fumar BOOLEAN DEFAULT FALSE,
    permite_visitas BOOLEAN DEFAULT FALSE,
    estado VARCHAR(20) DEFAULT 'Activa',
    vistas INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de fotos
CREATE TABLE fotos_publicacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publicacion_id UUID REFERENCES publicaciones(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    subida_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de favoritos
CREATE TABLE favoritos (
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    publicacion_id UUID REFERENCES publicaciones(id) ON DELETE CASCADE,
    guardado_el TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, publicacion_id)
);

-- 6. Tabla de reseñas
CREATE TABLE resenas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    autor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    evaluado_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INT CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización (Los tuyos + los nuevos necesarios)
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_verificaciones_usuario_id ON verificaciones(usuario_id);
CREATE INDEX idx_publicaciones_autor_id ON publicaciones(autor_id);
CREATE INDEX idx_publicaciones_location ON publicaciones(latitud, longitud);
CREATE INDEX idx_publicaciones_tipo ON publicaciones(tipo_publicacion);