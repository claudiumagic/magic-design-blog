export const truncate = (text = "", max = 160) => {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trim() + "…";
};

export const buildSeo = ({
  title = "",
  description = "",
  image = "",
  url = "",
}) => {
  return {
    title: truncate(title, 60),
    description: truncate(description, 160),
    image,
    url,
  };
};
