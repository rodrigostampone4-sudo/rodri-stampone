# Rodrigo Stampone

Código fuente del sitio oficial de Rodrigo Stampone.

[rodristampone.events](https://rodristampone.events/)

## Proyecto

Landing mobile-first desarrollada con Astro y TypeScript, con contenido
administrado desde Sanity Studio.

```text
src/      Landing pública
studio/   CMS editorial
docs/     Documentación técnica
```

## Desarrollo local

Requiere Node.js 22.12 o posterior (anterior a 25) y npm.

Para ejecutar la landing:

```bash
npm install
npm run dev
```

Para ejecutar el Studio:

```bash
cd studio
npm install
npm run dev
```

Antes de iniciar cada aplicación, copiá su archivo `.env.example` a `.env` y
completá las variables indicadas.

## Validación

Desde la raíz:

```bash
npm test
npm run check
npm run build
npm --prefix studio run check
npm --prefix studio run build
```

La arquitectura y las decisiones técnicas principales están resumidas en
[`docs/architecture.md`](docs/architecture.md).
