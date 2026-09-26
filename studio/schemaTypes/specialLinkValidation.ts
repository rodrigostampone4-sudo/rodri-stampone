type ValidationContext = { parent?: unknown };

function requiredWhenEnabled(
  isPresent: (value: unknown) => boolean,
  message: string,
) {
  return (value: unknown, context: ValidationContext): true | string => {
    const enabled = (context.parent as { enabled?: unknown } | undefined)?.enabled;
    return enabled !== true || isPresent(value) || message;
  };
}

function isNonEmptyText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSecureHttpsUrl(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isReference(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { _ref?: unknown })._ref === 'string' &&
    (value as { _ref: string })._ref.trim().length > 0
  );
}

export const specialLinkValidators = {
  title: requiredWhenEnabled(
    isNonEmptyText,
    'El título es obligatorio cuando el link especial está habilitado.',
  ),
  url: requiredWhenEnabled(
    isSecureHttpsUrl,
    'Ingresá una URL https válida cuando el link especial está habilitado.',
  ),
  producer: requiredWhenEnabled(
    isReference,
    'La productora es obligatoria cuando el link especial está habilitado.',
  ),
  venue: requiredWhenEnabled(
    isReference,
    'El venue es obligatorio cuando el link especial está habilitado.',
  ),
};
