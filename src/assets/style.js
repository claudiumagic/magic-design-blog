// src/assets/style.js

export const layout = {
  pageSection: `
    mx-auto
    max-w-7xl
    2xl:max-w-[1600px]
    px-6 py-10
    rounded-3xl
    shadow-[0_0_0_1px_rgba(255,250,222,0.06)]
  `,
};

export const card = {
  wrapper: `
    group
    relative
    rounded-2xl
    overflow-hidden
    flex flex-col

    border-2 border-violet-100

    bg-[rgba(251,250,255,0.45)]
    hover:bg-[rgba(247,244,255,0.85)]

    shadow-sm
    transition-all duration-300
    ease-[cubic-bezier(.22,1,.36,1)]

    transform-gpu
    will-change-transform

    hover:shadow-[0_14px_40px_rgba(42,18,74,0.14)]
    hover:scale-[1.02]
    hover:border-violet-200
  `,

  image: `
    w-full h-48 object-cover
    transition-transform duration-500
    group-hover:scale-[1.04]
  `,

  body: `
    p-6 flex flex-col flex-1
  `,

  title: `
    text-xl font-semibold mb-3
    text-[#1f1a2e]
    transition-colors duration-300
    group-hover:text-[#1b1628]
  `,

  excerpt: `
    text-sm opacity-80 line-clamp-3 mb-4
    transition-opacity duration-300
    group-hover:opacity-95
  `,
};

export const pagination = {
  link: `
    flex items-center justify-center
    w-10 h-10 rounded-full
    transition-all duration-200
    opacity-60
  `,
  active: `
    scale-110 font-semibold opacity-100
  `,
};
export const form = {
  input: `
    border rounded-lg p-2 w-full text-sm
    placeholder:opacity-60
    transition
    focus:outline-none
    focus:ring-2 focus:ring-violet-300
  `,

  textarea: `
    border rounded-lg p-2 w-full text-sm min-h-[120px]
    placeholder:opacity-60
    transition
    focus:outline-none
    focus:ring-2 focus:ring-violet-300
  `,

  button: `
    bg-violet-600 text-white
    px-4 py-2 rounded-lg font-medium
    transition-all duration-300
    hover:bg-violet-700
    hover:scale-[1.03]
    active:scale-[0.98]
  `,

  hint: `
    text-xs opacity-60
  `,
};
