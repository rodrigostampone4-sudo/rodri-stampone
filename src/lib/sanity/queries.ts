const imageProjection = `{
  _type,
  alt,
  crop,
  hotspot,
  asset->{
    _id,
    url,
    metadata{dimensions}
  }
}`;

const contentProjection = `{
  _id,
  _type,
  "title": upper(title),
  date,
  "producerId": producer->_id,
  "producer": producer->name,
  "venue": coalesce(venue->name, venue),
  "venueMapsUrl": venue->mapsUrl,
  url,
  visible,
  featured,
  expiresAt
}`;

export const siteSettingsQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0]{
  _id,
  _type,
  name,
  instagramHandle,
  "profileImage": profileImage${imageProjection},
  bio,
  "links": coalesce(links[]{label, url, kind, enabled}, [])
}`;

export const siteSettingsCountQuery = `count(*[_type == "siteSettings"])`;

export const visibleEventsQuery = `*[_type == "event" && visible == true]
  | order(featured desc, date asc, _createdAt asc)
  ${contentProjection}`;

export const eventsByDateQuery = `*[_type == "event"]
  | order(date asc, _createdAt asc)
  ${contentProjection}`;
