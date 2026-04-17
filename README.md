Sistema de Analítica de Biblioteca – AWOS
Información académica

Nombre del estudiante: Mazariegos Laguna, Carlos Andrés
Grupo: 5to C
Materia: Aplicaciones Web Orientadas a Servicios

Descripción del sistema

Este proyecto consiste en una aplicación web que permite visualizar reportes de una biblioteca a partir de datos almacenados en PostgreSQL.

La idea principal fue trabajar con vistas (views) en lugar de consultar directamente las tablas, de forma que la información ya esté procesada y lista para mostrarse en la aplicación.

El sistema permite consultar distintos reportes como:

usuarios con préstamos vencidos
estado del inventario
actividad de usuarios
libros más prestados
resumen de multas
actividad de préstamos

Todo esto se muestra en un dashboard con navegación entre diferentes vistas.

Tecnologías utilizadas
Next.js (App Router)
TypeScript
PostgreSQL
Docker y Docker Compose
Zod (validación de parámetros)
Estructura del proyecto

/database → Archivos SQL (schema, seed y views)
/src/app → Vistas y rutas de la aplicación
/services → Lógica para consultar las views
/models → Tipos y validaciones
/lib → Configuración de conexión a base de datos

Instrucciones de ejecución

Para ejecutar el proyecto es necesario tener Docker instalado.

Clonar el repositorio:

git clone https://github.com/iAndresML/biblioteca-analitica-awos-nextjs.git
cd biblioteca-analitica-awos-nextjs

Crear archivo .env a partir de .env.example:

cp .env.example .env

Levantar el proyecto:

docker compose down -v
docker compose up --build

Abrir en el navegador:

http://localhost:3000

Variables de entorno

Las variables necesarias se encuentran en el archivo .env.example.

Las principales son:

DATABASE_URL → conexión a la base de datos
DB_ADMIN_USER → usuario de PostgreSQL
DB_ADMIN_PASSWORD → contraseña
DB_NAME → nombre de la base de datos

Estas variables permiten que la aplicación se conecte correctamente sin exponer datos directamente en el código.

Endpoints disponibles

/api/reports?type=overdue → préstamos vencidos
/api/reports?type=inventory → estado del inventario
/api/reports?type=users → actividad de usuarios

Vistas en la aplicación

El sistema incluye varias pantallas accesibles desde el dashboard:

Morosidad (/reports/overdue)
Inventario (/reports/inventory)
Usuarios (/reports/users)
Libros más prestados (/reports/top-books)
Resumen de multas (/reports/fines-summary)
Actividad de préstamos (/reports/loan-activity)

Cada vista permite visualizar información específica y en algunos casos aplicar filtros.

Notas finales

El proyecto fue desarrollado enfocándose en separar responsabilidades entre base de datos, backend y frontend.

Las vistas en PostgreSQL se encargan de procesar la información, mientras que la aplicación solo se encarga de mostrarla.

Esto permite mantener una estructura más ordenada y fácil de mantener.