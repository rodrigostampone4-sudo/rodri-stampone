export const eventsQuery = `
  *[_type == "event"] | order(date asc, title asc) {
    _id,
    "title": upper(title),
    date,
    "venue": coalesce(venue->name, venue),
    url,
    visible,
    featured,
    expiresAt
  }
`;

export const siteSettingsQuery = `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    name,
    instagramHandle,
    bio,
    profileImage,
    "links": coalesce(links[] {
      _key,
      label,
      url,
      kind,
      enabled
    }, [])
  }
`;
