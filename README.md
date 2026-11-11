# Sistema de Gestión Inmobiliaria

## Descripción

Este proyecto se desarrolla como **Trabajo Práctico Integrador** para la cátedra **Bases de Datos**, en el marco de la carrera Ingeniería en Sistemas de la Información de la Universidad Tecnológica Nacional, Facultad Regional San Francisco (UTN F.R. San Francisco), cuyo diseño curricular ha sido establecido por la Ordenanza N.º 1877 del Consejo Superior de la Universidad Tecnológica Nacional.

Se propone desarrollar un **sistema de gestión integral para una agencia inmobiliaria**, destinado a centralizar y facilitar la administración de sus operaciones. El sistema permitirá gestionar, entre otras entidades y procesos:

- Propiedades.
- Propietarios.
- Inquilinos.
- Contratos de alquiler.

Los requisitos funcionales y no funcionales del sistema serán definidos y documentados posteriormente en el documento de especificación de requisitos (_Software Requirements Specification_), ubicado en [`docs/SRS.md`](docs/SRS.md).

## Tecnologías

Para el desarrollo de la solución se seleccionó el siguiente stack tecnológico:

| Tecnología                                         | Propósito                                        |
| -------------------------------------------------- | ------------------------------------------------ |
| [Next.js](https://nextjs.org/)                     | Framework para el desarrollo de la aplicación.   |
| [TypeScript](https://www.typescriptlang.org/)      | Lenguaje de programación y tipado estático.      |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS utility-first para el diseño y estilizado de interfaces. |
| [PostgreSQL](https://www.postgresql.org/)          | Sistema de gestión de bases de datos relacional. |
| [Docker](https://www.docker.com/)                  | Contenerización de los servicios.                |
| [Docker Compose](https://docs.docker.com/compose/) | Orquestación del entorno de desarrollo.          |
| [pnpm](https://pnpm.io/)                           | Gestor de paquetes y dependencias.               |

También se utilizan herramientas para mantener la calidad y consistencia del código:

- [ESLint](https://eslint.org/): análisis estático y detección de problemas en el código.
- [Prettier](https://prettier.io/): formateo automático.
- [Husky](https://typicode.github.io/husky/): ejecución de Git Hooks.
- [lint-staged](https://github.com/lint-staged/lint-staged): ejecución de validaciones sobre archivos preparados para commit.

## Instalación

### Requisitos previos

Antes de comenzar, es necesario contar con las siguientes herramientas instaladas:

- **Git:** para clonar el repositorio y gestionar el control de versiones.
- **Node.js:** versión compatible con la especificada en el proyecto (recomendado Node.js 22).
- **pnpm:** gestor de paquetes del proyecto.
- **Docker Engine / Docker Desktop:** para ejecutar los servicios contenerizados.
- **Docker Compose:** incluido en las versiones actuales de Docker Desktop y disponible como plugin de Docker Engine.

### Instalación de pnpm

Se recomienda habilitar Corepack para administrar la versión de pnpm declarada en `package.json`:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Verificar la instalación:

```bash
node --version
pnpm --version
```

### Instalación de Docker

Instalar Docker Desktop (macOS y Windows) o Docker Engine con el plugin Docker Compose (Linux).

Documentación oficial:

- [Instalación de Docker Desktop](https://docs.docker.com/get-started/get-docker/)
- [Instalación de Docker Engine](https://docs.docker.com/engine/install/)
- [Instalación de Docker Compose](https://docs.docker.com/compose/install/)

Verificar la instalación:

```bash
docker --version
docker compose version
```

### Clonar el repositorio

```bash
git clone https://github.com/nicolasfenoglio/bbdd-tp-integrador
cd bbdd-tp-integrador
```

### Instalar dependencias

```bash
pnpm install
```

Este comando instala las dependencias del proyecto y ejecuta los scripts de preparación configurados, incluyendo la inicialización de Husky.

### Configurar variables de entorno

El repositorio incluye un archivo `.env.example` con las variables de entorno necesarias para ejecutar el proyecto.

Antes de iniciar los servicios, se debe crear el archivo `.env` a partir de este ejemplo.

**Windows (CMD):**

```cmd
copy .env.example .env
```

**Windows (PowerShell), Linux y macOS:**

```bash
cp .env.example .env
```

Una vez creado, verificar su contenido y modificar los valores según las necesidades del entorno local.

El archivo `.env.example` contiene una configuración de referencia:

```dotenv
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_dev_password
POSTGRES_DB=my_database

# Backend
DATABASE_URL=postgresql://postgres:postgres_dev_password@postgres:5432/my_database
```

**Importante:** estos valores son únicamente de ejemplo. Cada desarrollador debe utilizar credenciales apropiadas para su entorno local. El archivo `.env` contiene información sensible y no debe incluirse en el repositorio. El archivo `.env.example`, en cambio, sí debe mantenerse versionado para facilitar la configuración de nuevos entornos.

## Primeros pasos

### Iniciar el entorno de desarrollo

Con Docker en ejecución, levantar los servicios mediante:

```bash
docker compose up --build
```

Docker Compose iniciará los siguientes servicios:

| Servicio   | Descripción                            | Puerto |
| ---------- | -------------------------------------- | ------ |
| `backend`  | Aplicación Next.js en modo desarrollo. | `3000` |
| `postgres` | Instancia de PostgreSQL.               | `5432` |

El backend se ejecuta utilizando el servidor de desarrollo de Next.js, que proporciona recompilación y actualización automática ante cambios en el código (_Fast Refresh_).

PostgreSQL utiliza un volumen persistente para conservar los datos entre reinicios y recreaciones de los contenedores.

### Preparar la base de datos

Con PostgreSQL en ejecución, generar el cliente de Prisma, aplicar las migraciones y cargar los datos de ejemplo:

```bash
pnpm db:generate   # genera el cliente en app/generated/prisma
pnpm db:migrate    # crea las tablas (prisma/migrations)
pnpm db:seed       # borra y carga datos de ejemplo (prisma/seed.sql)
```

### Funcionalidades

- **Propiedades, Propietarios, Inquilinos y Contratos:** alta, baja y listado de cada entidad. Al crear un contrato la propiedad pasa a `Alquilada`; al finalizarlo o rescindirlo vuelve a `Disponible` (ambas operaciones en una transacción).
- **Consultas** (`/consultas`, cada una muestra su SQL equivalente):
  1. Propiedades disponibles por zona.
  2. Contratos vigentes que vencen en los próximos N días.
  3. Resumen de propiedades por zona (total, disponibles, alquiladas, alquiler promedio).
  4. Ingreso mensual por propietario según contratos vigentes.

### Acceder a la aplicación

Una vez iniciados los servicios, la aplicación estará disponible en:

- Aplicación: http://localhost:3000
- PostgreSQL: `localhost:5432`

Para conectarse a PostgreSQL desde herramientas externas, utilizar las credenciales definidas en `.env`.

### Ejecutar en segundo plano

Si se desea iniciar los servicios sin mantener abierta la terminal:

```bash
docker compose up --build -d
```

### Consultar logs

Ver los logs de todos los servicios:

```bash
docker compose logs -f
```

Ver únicamente los logs del backend:

```bash
docker compose logs -f backend
```

### Detener el entorno

Para detener los servicios:

```bash
docker compose down
```

Esto elimina los contenedores, pero conserva los datos almacenados en los volúmenes persistentes.

Para eliminar también los volúmenes y los datos de PostgreSQL:

```bash
docker compose down -v
```

**Advertencia:** este último comando elimina permanentemente los datos almacenados en los volúmenes asociados al proyecto.

### Comandos adicionales

Ejecutar comandos dentro del contenedor del backend:

```bash
docker compose exec backend <COMMAND>
```

Acceder a la consola de PostgreSQL:

```bash
docker compose exec postgres psql -U postgres -d my_database
```

Reconstruir los servicios:

```bash
docker compose up --build
```

## Colaboración

Se establecen las siguientes convenciones y herramientas para mantener un flujo de trabajo consistente entre los integrantes del equipo.

### Git Hooks y calidad de código

El proyecto utiliza Husky para automatizar verificaciones durante determinadas operaciones de Git.

#### Pre-commit

Antes de generar un commit, se ejecuta automáticamente `lint-staged`, que procesa únicamente los archivos preparados para el commit (_staged files_).

Para los archivos JavaScript y TypeScript:

1. ESLint analiza el código e intenta corregir automáticamente los problemas solucionables (`--fix`).
2. Prettier aplica el formato establecido.

Para los archivos de configuración, estilos y documentación compatibles, se ejecuta Prettier.

Si alguna de estas herramientas falla, el commit se cancela.

#### Pre-push

Antes de enviar los cambios al repositorio remoto, se ejecutan las siguientes verificaciones:

- **ESLint:** detección de errores y problemas de calidad.
- **TypeScript:** verificación de tipos mediante `tsc --noEmit`.

Si alguna validación falla, Git cancela el push.

#### Ejecutar validaciones manualmente

También es posible ejecutar las herramientas de manera independiente:

```bash
# Analizar código
pnpm lint

# Corregir problemas solucionables de ESLint
pnpm lint:fix

# Formatear archivos
pnpm format

# Comprobar formato
pnpm format:check

# Verificar tipos
pnpm typecheck

# Construir la aplicación
pnpm build
```

### Flujo de trabajo con Git

Se recomienda trabajar utilizando ramas independientes para cada funcionalidad, corrección o tarea.

Ejemplo de flujo:

```bash
# Actualizar la rama principal
git switch main
git pull origin main

# Crear una nueva rama
git switch -c feat/property-management

# Preparar cambios
git add .

# Generar commit
git commit -m "feat(properties): add property management"

# Publicar la rama
git push -u origin feat/property-management
```

Una vez finalizado el desarrollo, se deberá abrir un **Pull Request (PR)** hacia la rama principal (`main`) para solicitar la incorporación de los cambios.

#### Pull Requests y revisión de código

La integración de cambios a `main` deberá cumplir obligatoriamente con las siguientes condiciones:

1. El desarrollador deberá publicar su rama de trabajo y crear un Pull Request hacia `main`.
2. El Pull Request deberá incluir una descripción clara de los cambios realizados y su propósito.
3. Al menos **un integrante distinto del autor del Pull Request** deberá revisar los cambios y aprobarlos.
4. Una vez obtenida la aprobación, el Pull Request podrá integrarse a `main`.

**Importante:** no se deberán incorporar cambios directamente a `main` mediante commits o pushes. Toda modificación deberá pasar por el proceso de revisión establecido, con el objetivo de promover la revisión cruzada del código y mantener la calidad e integridad de la rama principal.

### Convenciones de commits

Se adopta el estándar [Conventional Commits](https://www.conventionalcommits.org/), con el siguiente formato:

```text
<type>(<scope>): <description>
```

Donde:

- `type`: tipo de modificación realizada.
- `scope`: módulo o componente afectado (opcional).
- `description`: descripción breve, clara y en inglés.

#### Tipos de commit

| Tipo       | Descripción                                                  |
| ---------- | ------------------------------------------------------------ |
| `feat`     | Incorporación de una nueva funcionalidad.                    |
| `fix`      | Corrección de un error.                                      |
| `docs`     | Modificaciones en documentación.                             |
| `style`    | Cambios de formato que no afectan la lógica.                 |
| `refactor` | Reestructuración del código sin modificar su comportamiento. |
| `test`     | Incorporación o modificación de pruebas.                     |
| `chore`    | Tareas de mantenimiento y configuración.                     |
| `perf`     | Mejoras de rendimiento.                                      |
| `build`    | Cambios relacionados con el proceso de construcción.         |
| `ci`       | Cambios en integración y despliegue continuo.                |

#### Ejemplos

```text
feat(properties): add property registration
feat(contracts): implement contract management
fix(auth): resolve session expiration issue
docs(readme): update installation instructions
refactor(database): centralize connection management
test(properties): add registration tests
chore(deps): update dependencies
```

Se recomienda mantener los commits pequeños y enfocados en una única modificación lógica.

## Accesos y documentación

### Documentación del proyecto

| Recurso                                           | Descripción                                          |
| ------------------------------------------------- | ---------------------------------------------------- |
| [Especificación de requisitos (SRS)](docs/SRS.md) | Requisitos funcionales y no funcionales del sistema. |
| [Repositorio](https://github.com/nicolasfenoglio/bbdd-tp-integrador)                     | Código fuente y seguimiento del desarrollo.          |

### Documentación de tecnologías

- [Next.js](https://nextjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [pnpm](https://pnpm.io/motivation)
- [ESLint](https://eslint.org/docs/latest/)
- [Prettier](https://prettier.io/docs/)
- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/lint-staged/lint-staged)

---

**Universidad Tecnológica Nacional – Facultad Regional San Francisco**  
Ingeniería en Sistemas de la Información  
Cátedra: Bases de Datos
