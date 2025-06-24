export const textFilters = [
  { value: "equals", label: "Teng" },
  { value: "contains", label: "Ichida" },
  { value: "starts_with", label: "Boshlanadi" },
  { value: "regex", label: "Regex" },
  { value: "command", label: "Buyruq" },
];

export const locationFilters = [
  { value: "any", label: "Har qanday" },
  { value: "radius", label: "Radius" },
];

export const fileFilters = [
  { value: "any", label: "Har qanday" },
  { value: "extension", label: "Kengaytma" },
  { value: "size", label: "Hajm" },
];

export const Filters = {
  textFilters,
  locationFilters,
  fileFilters,
};
