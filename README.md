# Sistema de Analítica de Biblioteca – AWOS

## Información académica
* **Nombre del estudiante:** Mazariegos Laguna, Carlos Andrés
* **Grupo:** 5to C
* **Materia:** Aplicaciones Web Orientadas a Servicios

---

## Descripción del sistema
Este proyecto consiste en un módulo robusto de analítica de datos para el seguimiento administrativo e inventario de una biblioteca. Las principales características que distinguen su arquitectura técnica son:

* **Uso de Next.js:** Se aprovecha el App Router (`app/`) para generar aplicaciones de alto rendimiento, favoreciendo los _Server Components_ para recuperar los datos y pre-renderizarlos seguros sin exponer lógica en el cliente.
* **Uso de PostgreSQL:** Motor de base de datos relacional para procesamiento estructurado y fiable, operando como única verdad fundamental.
* **Uso de VIEWS:** Toda la carga computacional analítica (como las sumatorias de multas, promedios de pérdida y agrupamientos de fechas) está delegada a reportes SQL (Views). El Backend y Frontend **se limitan** estricta y virtuosamente a ser una capa de transporte visual sobre los resultados procesados, preservando el principio *Open/Closed*.
* **Arquitectura AWOS:** Mantenimiento de una capa de servicios (`ReportsService`) delimitada por Objetos de Transferencia de Datos (DTOs) que blindan e hidrolizan los tipos esperados y separan las responsabilidades lógicamente.
* **Dashboards implementados:** Las vistas se renderizan a través del servidor para asegurar que los _Stakeholders_ dispongan de tiempos de carga eficientes e índices estadísticos interactivos.

---

## Tecnologías utilizadas
* **Next.js**: Framework de la interfaz de usuario y SSR.
* **TypeScript**: Tipado sólido indispensable para la confiabilidad.
* **PostgreSQL**: Persistencia y lógica relacional robusta.
* **Docker / Docker Compose**: Containerización para reproducibilidad dev/ops sin conflictos en dependencias locales.
* **Zod**: Robustez y protección total contra payloads en las APIs y URLs (_searchParams_).

---

## Estructura del proyecto
La estructura modular elegida ha sido simplificada para favorecer la separación de responsabilidades en la API y el Cliente Frontal:
* `/database`: Contiene los archivos de inicialización `.sql` fundamentales (Schemas, Semillas, y Vistas) desplegables autmáticamente por el contenedor de PostgreSQL.
* `/src/app`: Enrutador global de Next.js. Maneja la presentación asíncrona de los tableros analíticos listos para el cliente bajo el patrón App Router.
* `/services`: Colección orientada a objetos de despachadores asíncronos autorizados únicamente a establecer peticiones parametrizadas `pg` contra las _Views_ de la DB. Mantiene la comunicación blindada de ataques lógicos y _SQL Injection_.
* `/models`: Centro de tipado de la aplicación. Acopla la robustez transaccional guardando los *DTOs* (Interfaces) y los *Schemas* validadores de Zod.
* `/lib`: Configuraciones basales e instancias de persistencia únicas como el *pool* de conexión centralizada para `pg`.

---

## Instrucciones de ejecución (CRÍTICO)

Asegúrese de contar con Docker y Docker Compose activos en su máquina anfitrión. Siga el siguiente paso a paso:

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/iAndresML/biblioteca-analitica-awos-nextjs.git
   cd biblioteca-analitica-awos-nextjs
   ```

2. **Crear archivo .env basado en .env.example**
   ```bash
   cp .env.example .env
   ```
   *(Asegúrese de que el entorno esté completo; en este caso puede usar las opciones por default dispuestas en el archivo de ejemplo).*

3. **Ejecutar Docker (Construir contenedores e Iniciar base de datos):**
   ```bash
   docker compose down -v
   docker compose up --build
   ```

4. **Acceder al sistema:**
   Navegue desde su navegador a:
   [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno
Para el correcto funcionamiento del ecosistema se hace uso de las siguientes variables presentes dentro del fichero `.env`.
* `DATABASE_URL`: Es la URI primordial general donde la aplicación base Next.js (El Container `web`) podrá llegar y autenticarse dinámicamente con el motor de reportes.
* `DB_ADMIN_USER`: Rol administrativo designado en la inicialización subyacente para Postgres (Ejemplo: `postgres`).
* `DB_ADMIN_PASSWORD`: Clave sensible generada con altos privilegios para arrancar esquemas completos.
* `DB_NAME`: Título lógico del universo de bases relacionales de la BD (Ejemplo: `library_db`).

---

## Endpoints disponibles
La arquitectura AWOS provee salidas dinámicas consumibles externamente parametrizadas con `type` a través de JSON:
* `/api/reports?type=overdue` → Retorna en JSON el consolidado en vivo de usuarios morosos, deuda pendiente y días en atraso.
* `/api/reports?type=inventory` → Retorna en JSON analíticas detalladas orientadas a libro como pérdida de acervo o stock restante.
* `/api/reports?type=users` → Retorna en JSON resúmenes agregados del comportamiento del usuario (total perfiles activos, deudores absolutos, ratio de préstamos).

---

## Vistas implementadas a nivel Cliente UI
Se despliegan seis tableros completos renderizados dinámicamente en vivo orientados a distintos analistas corporativos:

1. **Morosidad** (`/reports/overdue`): Panel de búsqueda enfocado a cobranza.
2. **Inventario** (`/reports/inventory`): Control dinámico categorizado del estado actual de títulos.
3. **Usuarios** (`/reports/users`): Seguimiento por reputación económica de prestatarios.
4. **Libros más prestados** (`/reports/top-books`): Ranking total con análisis de volumen por autor.
5. **Resumen de multas** (`/reports/fines-summary`): Progresión monetaria temporal (%) entre deudas cobradas vs omitidas de forma mensual.
6. **Actividad de préstamos** (`/reports/loan-activity`): Monitoreo de uso diario e higiene de regresos y retornos sobre activos.
