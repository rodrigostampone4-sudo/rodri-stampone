# Arquitectura actual

```text
Visitantes
    ↓
https://rodristampone.events/
    ↓
Vercel: rodri-stampone
    ↓
Landing Astro estática

Administración:
https://admin.rodristampone.events/
    ↓
Vercel: rodri-stampone-cms
    ↓
Sanity Studio
    ↓
Sanity Content Lake
    ↓
Webhook filtrado
    ↓
Deploy Hook de Vercel
    ↓
Rebuild estático de producción
```

La landing se genera como un sitio estático con Astro y tiene un enfoque
mobile-first. Sanity Studio es una aplicación separada dentro del repositorio
y Sanity es la única fuente de verdad para el contenido dinámico.

La capa `src/lib/sanity/` concentra el cliente y las consultas GROQ para evitar
dispersarlas en páginas o componentes futuros. El proyecto Sanity real está
configurado localmente y en Vercel mediante variables de entorno públicas; usa
el dataset `production` para lectura desde Astro. Las escrituras administrativas
y la gestión del webhook se realizan mediante la CLI/API oficial autenticada.

## Despliegue actual

El repositorio GitHub actual `rodrigostampone4-sudo/rodri-stampone` está
conectado a los proyectos Vercel `rodri-stampone` y `rodri-stampone-cms`.
`main` es la rama de producción de ambos. La landing usa la raíz `.`, el preset
Astro, `npm run build` y la salida `dist/`; su dominio público es
`https://rodristampone.events/` y `PUBLIC_SITE_URL` debe declararlo como
canonical. Sanity Studio se publica por separado desde `studio/`, también con
`npm run build` y salida `dist/`, y su dominio público es
`https://admin.rodristampone.events/`.

El CMS de Vercel es la única interfaz pública del Studio. Sanity mantiene el
registro externo del workspace y sus schemas, pero no se publica una segunda
copia alojada del Studio. Ese registro se actualiza desde `studio/` con
`sanity deploy --external --schema-required`.

Como Vercel trata `studio/` como Root Directory, el código del CMS debe ser
autocontenido dentro de esa carpeta. No puede importar módulos del frontend. La
suite raíz puede comparar invariantes compartidas entre ambos límites sin
acoplar sus builds.

El webhook document-level de Sanity usa el dataset `production`, método `POST`,
no incluye drafts ni versiones y filtra los documentos que cambian el HTML
público:

```groq
_type == "siteSettings" || _type == "event" || _type == "venue" || _type == "producer"
```

Su destino es un Deploy Hook de Vercel para `main`. La URL del hook es un
secreto operativo y no se documenta ni se versiona.

La ruta pública de diagnóstico fue retirada. La conexión se comprueba con
`sanity:smoke`, los builds y la landing resultante, sin publicar inventarios
internos auxiliares.

## Expiración de eventos

Si `expiresAt` tiene un valor explícito, ese valor manda.

Si `expiresAt` está vacío, la landing considera como expiración
automática el día siguiente a la fecha del evento a las 08:00 en la zona
horaria `America/Argentina/Buenos_Aires`.

Por ejemplo, un evento del `2026-08-29` expira automáticamente el
`2026-08-30 08:00 America/Argentina/Buenos_Aires`. La regla se expresa con el
identificador de zona horaria y no con un offset UTC fijo.

El navegador aplica la regla en la hora exacta. Un Cron Job diario de Vercel
dispara además un Deploy Hook a las `11:00 UTC` para que el HTML estático deje
de contener los eventos vencidos. GitHub Actions vuelve a invocar el mismo hook
a las `11:05 UTC` como garantía posterior al límite de las `08:00` en
`America/Argentina/Buenos_Aires`. La URL del hook y `CRON_SECRET` sólo viven en
variables protegidas de Vercel o en secretos de GitHub.

## UX V1 del Studio

El Studio self-hosted presenta un panel de contenido en Structure Builder con
las secciones `Inicio`, `Eventos`, `Venues`, `Productoras`, `Links` y `Perfil`.
Inicio resume próximos eventos, links activos y perfil; Eventos agrega pestañas
de próximos, pasados y todos, búsqueda por título o lugar y estados `Visible`,
`Oculto`, `Finalizado` con la prioridad de visibilidad definida por el schema.

Los componentes del panel solo consultan contenido y abren los intents nativos
de Sanity para crear o editar. No hay una segunda base, API ni sistema de
publicación: el singleton `siteSettings` sigue concentrando perfil y
`links[]`, y el array conserva el ordenamiento nativo. Los formularios usan
grupos de campos para separar datos, visibilidad, opciones avanzadas, Perfil y
Links; borrador y publicación siguen siendo acciones explícitas del editor
nativo. `siteSettings` queda fuera del menú global de creación y no expone
duplicar, despublicar ni borrar, para proteger su identidad de singleton.

Las superficies personalizadas están en español y son responsive desde mobile.
La navegación mobile usa el panel nativo de Sanity para conservar deep links y
la semántica de panes; no se agregó una navegación inferior paralela. El estado
de evento mantiene una copia local de la política horaria porque el Studio se
despliega de forma aislada. Las pruebas raíz verifican su paridad con la landing:
expiración automática al día siguiente a las 08:00 de
`America/Argentina/Buenos_Aires`.

## Configuración transferible

`PUBLIC_SITE_URL=https://rodristampone.events/` define canonical, Open Graph,
robots y sitemap. El Studio usa
`SANITY_STUDIO_LANDING_URL=https://rodristampone.events/` para el acceso “Ver
landing”. El código conserva un fallback HTTPS de seguridad, pero producción
debe definir ambas variables con el dominio canónico.

Sanity debe autorizar `https://admin.rodristampone.events` como origin CORS con
credenciales. No se autorizan wildcards con credenciales; cualquier origin
alternativo se conserva sólo mientras exista un uso operativo explícito.

Los workflows de GitHub validan ambos paquetes sin desplegar ni almacenar
tokens de Vercel. La integración Git de cada proyecto conserva la
responsabilidad del deployment. Las reglas de protección, CODEOWNERS, alertas,
variables, dominios, CORS, hooks y accesos se administran en cada servicio y no
se consideran resueltos sólo por estar documentados en el repositorio.

El seed es un bootstrap para un dataset vacío, no una copia de seguridad. Crea
venues, productoras, `siteSettings` y eventos iniciales con referencias actuales;
si detecta contenido parcial, aborta. La continuidad del contenido real exige
transferir Sanity y conservar exports/assets por el mecanismo operativo acordado.
