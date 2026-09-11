# Rodrigo Stampone

Landing mobile-first de Rodrigo Stampone y panel editorial asociado.

## Stack

- Astro para la landing estática.
- TypeScript en modo estricto.
- Sanity como CMS y fuente de verdad del contenido dinámico.
- Vercel como destino de producción de la landing y del Studio self-hosted.

El Studio oficial de Sanity requiere React, `react-dom` y
`styled-components` como runtime. Esas dependencias están aisladas dentro de
`studio/`; no forman parte del frontend Astro.

## Estructura principal

```text
src/
├── pages/                 # Páginas Astro
├── lib/sanity/            # Cliente y consultas GROQ centralizadas
├── lib/events/            # Reglas de dominio de eventos
└── types/                 # Tipos de contenido
studio/                    # Sanity Studio independiente
docs/                      # Arquitectura del sistema
```

## UX V1 del Studio

El Studio usa Structure Builder como panel de contenido con `Inicio`, `Eventos`,
`Venues`, `Productoras`, `Links` y `Perfil`. Conserva los editores, intents,
borradores y publicación nativos de Sanity. Las decisiones de estructura y
comportamiento están en
[`docs/architecture.md`](docs/architecture.md#ux-v1-del-studio).

## Desarrollo local

Instalá las dependencias de la landing y levantá Astro:

```bash
npm install
npm run dev
```

Para levantar el Studio en otra terminal:

```bash
cd studio
npm install
npm run dev
```

## Builds y variables de entorno

El build de Astro se ejecuta con:

```bash
npm test
npm run check
npm run build
```

El Studio se valida y compila desde `studio/` con:

```bash
npm run check
npm run build
```

Copiá `.env.example` a `.env` para Astro y `studio/.env.example` a
`studio/.env` para el Studio. Se requieren:

- Astro: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` y
  `PUBLIC_SITE_URL`.
- Studio: `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` y
  `SANITY_STUDIO_LANDING_URL`.

El dataset previsto es `production`. No se incluyen tokens ni secretos en Git.
El proyecto conectado usa el dataset público `production` para que Astro pueda
leer el contenido publicado sin token privado. Las escrituras administrativas
se realizan mediante la sesión autenticada de la CLI.

## Seed y smoke test

Desde la raíz, con la sesión de Sanity autenticada:

```bash
npm run sanity:seed
npm run sanity:smoke
```

El contenido inicial vive en `studio/scripts/seed-content.ts`, junto con los
catálogos estables de venues y productoras. El seed crea el conjunto completo,
con sus referencias, únicamente cuando el dataset no contiene contenido
administrado. Una segunda ejecución lo preserva; si encuentra un dataset
parcial o diferente, aborta en vez de mezclar fixtures antiguos con contenido
editorial.

Este bootstrap no es un backup de producción. Los exports del Content Lake y
los assets deben respaldarse y transferirse mediante las herramientas de
Sanity durante el handoff; el repositorio no intenta congelar el contenido vivo.

`sanity:smoke` es de solo lectura y comprueba conexión, singleton, estructura,
URLs, tipos y orden cronológico sin fijar cantidades ni contenido editorial.
La verificación del bootstrap comprueba que sus documentos base existen y que
los eventos conservan referencias válidas, pero no compara copy ni cantidades
totales:

```bash
npm run sanity:verify-seed
```

## Despliegue y pipeline de contenido

El repositorio GitHub actual es
<https://github.com/rodrigostampone4-sudo/rodri-stampone>. La rama `main` es la rama
de producción. GitHub Actions ejecuta tests, checks y builds de landing y Studio
en cada pull request y push a `main`; Vercel continúa desplegando mediante su
integración Git y no recibe tokens desde GitHub Actions.

El frontend está conectado al proyecto Vercel `rodri-stampone`. El proyecto usa
la raíz del repositorio
(`.`), preset Astro, `npm run build` y salida `dist/`. Sanity Studio permanece
fuera del despliegue público de la landing. La URL pública de producción es
<https://rodristampone.events/> y `PUBLIC_SITE_URL` debe usar ese mismo host
como canonical; `www.rodristampone.events` y el dominio estable de Vercel
redirigen allí.

El CMS principal está self-hosted en el proyecto Vercel independiente
`rodri-stampone-cms`, conectado al mismo repositorio y a la rama `main`. Usa
`studio/` como Root Directory, preset `Other`, `npm run build` como comando y
`dist/` como salida. Su URL pública es
<https://admin.rodristampone.events/>. Los despliegues normales de ambos
proyectos se generan desde la integración Git sobre `main`.

El CMS usa Sanity como Content Lake sobre el proyecto y dataset `production`,
y la autenticación de Sanity para las operaciones administrativas. El origin
`https://admin.rodristampone.events` debe estar autorizado en Sanity mediante
CORS con credenciales. No agregues `*.vercel.app` ni otro wildcard con
credenciales; conservá un origin alternativo de Vercel sólo mientras se use de
forma explícita.

El CMS self-hosted está registrado en Sanity como Studio externo. Ese registro
permite que Sanity Dashboard resuelva el workspace y sus schemas sin publicar
una segunda copia del Studio. Después de cambios en los schemas, actualizá el
registro desde `studio/`:

```bash
npx sanity deploy --external --schema-required
```

No ejecutes `sanity deploy` sin `--external`: el único CMS público debe seguir
siendo el proyecto `rodri-stampone-cms` de Vercel.

La configuración de producción de la landing requiere estas variables públicas:

```text
PUBLIC_SANITY_PROJECT_ID=3qxptft9
PUBLIC_SANITY_DATASET=production
PUBLIC_SITE_URL=https://rodristampone.events/
```

El CMS requiere la configuración equivalente:

```text
SANITY_STUDIO_PROJECT_ID=3qxptft9
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_LANDING_URL=https://rodristampone.events/
```

Los dominios se cambian mediante estas variables, sin modificar componentes.

El proyecto está conectado a GitHub para que `main` sea la rama de producción.
Además, un Deploy Hook de Vercel permite iniciar un rebuild de producción sin
versionar su URL.

Sanity tiene un webhook document-level habilitado para `production`. Dispara un
`POST` al Deploy Hook únicamente cuando se crea, actualiza o elimina un
documento público que afecta la landing (`siteSettings`, `event`, `venue` o
`producer`);
los drafts y las versiones no lo disparan. El flujo conceptual es:

```text
Sanity publicado
    ↓ filtro siteSettings, event, venue o producer
Webhook Sanity
    ↓ POST
Deploy Hook Vercel (rama main)
    ↓ npm run build
Astro estático en Vercel
```

Vercel también ejecuta `/api/cron/rebuild` a las `11:00 UTC` para regenerar el
HTML al finalizar la ventana diaria de eventos. La landing mantiene además una
guarda en el navegador para ocultarlos en la hora exacta aunque el rebuild se
demore. Como garantía adicional, GitHub Actions invoca el Deploy Hook a las
`11:05 UTC` (`08:05 America/Argentina/Buenos_Aires`) mediante el secreto
`EXPIRATION_REBUILD_HOOK_URL`.

## Operación y cierre del handoff

El repositorio GitHub y los proyectos Vercel de landing y CMS despliegan desde
`main` bajo la operación del propietario actual. El código deja configurables
los dominios, pero no versiona secretos ni datos de propiedad. Para cerrar o
revalidar un handoff se debe:

1. definir las variables de producción de ambos proyectos con los dominios
   canónicos indicados arriba;
2. confirmar que ambos proyectos Vercel siguen conectados a este repositorio y
   a `main`;
3. revisar el Cron Job y el Deploy Hook de producción;
4. guardar el hook vigente en el secreto de GitHub Actions
   `EXPIRATION_REBUILD_HOOK_URL`;
5. mantener en Sanity sólo los origins CORS exactos que se utilicen;
6. rotar hooks y tokens, y revocar accesos del operador anterior cuando el
   propietario confirme acceso independiente;
7. demostrar el flujo publicación de Sanity → deployment `READY` → landing.

Las URLs de hooks, tokens, claim codes y credenciales son secretos operativos y
nunca deben copiarse a Git, CI ni documentación.
