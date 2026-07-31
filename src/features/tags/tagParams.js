export function toggleTagParam(params, tag) {
  const next = new URLSearchParams(params);
  const hadTag = next.getAll("tag").includes(tag);
  const tags = next.getAll("tag").filter((current) => current !== tag);
  next.delete("tag");
  tags.forEach((current) => next.append("tag", current));
  if (!hadTag) next.append("tag", tag);
  return next;
}

export function clearTagParams(params) {
  const next = new URLSearchParams(params);
  next.delete("tag");
  return next;
}
