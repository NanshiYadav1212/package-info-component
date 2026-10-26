// // import pkg from './package.json' assert { type: 'json' };

// export default {
//   name: pkg.name,
//   triggers: {
//     keywords: [
//       "npm",
//       "package info",
//       "packages like",
//       "compare packages",
//       "package alternatives",
//       "npm vs",
//       "best npm package for"
//     ]
//   },
//   query_format: {
//     regex: [
//       "HD_PACKAGES.NPM_PACKAGES",
//       "(npm( packages?)?|package info) HD_PACKAGES.NPM_PACKAGES",
//       "(latest|current) version of HD_PACKAGES.NPM_PACKAGES",
//       "compare( npm)?( packages?)? HD_PACKAGES.NPM_PACKAGES(,| vs| versus| and) HD_PACKAGES.NPM_PACKAGES((,| vs| versus| and) HD_PACKAGES.NPM_PACKAGES)?",
//       "HD_PACKAGES.NPM_PACKAGES vs HD_PACKAGES.NPM_PACKAGES( vs HD_PACKAGES.NPM_PACKAGES)?",
//       "(npm )?(alternatives?( to| for)|packages? (like|similar to)) HD_PACKAGES.NPM_PACKAGES( npm)?",
//       "HD_PACKAGES.NPM_PACKAGES [0-9]+(\\.[0-9]+)? vs [0-9]+(\\.[0-9]+)?",
//       "(best|top) npm (package|library) for [a-zA-Z0-9 -]+",
//       "(npm )?(package|library) for [a-zA-Z0-9 -]+"
//     ]
//   },
//   client: {
//     location: pkg.module,
//     moduleName: pkg.umdName || 'HD' + pkg.name,
//     baseURL: '/' + pkg.name
//   },
//   format: {
//     mainline: true,
//     sidebar: true
//   },
//   permissions: {},
//   info: {},
//   github: "",
//   demovideo: ""
// };
import pkg from './package.json';

export default {
  name: pkg.name,
  triggers: {
    keywords: [
      "npm",
      "package info",
      "packages like",
      "compare packages",
      "package alternatives",
      "npm vs",
      "best npm package for"
    ]
  },
  query_format: {
    regex: [
      "HD_PACKAGES.NPM_PACKAGES",
      "(npm( packages?)?|package info) HD_PACKAGES.NPM_PACKAGES",
      "(latest|current) version of HD_PACKAGES.NPM_PACKAGES",
      "compare( npm)?( packages?)? HD_PACKAGES.NPM_PACKAGES(,| vs| versus| and) HD_PACKAGES.NPM_PACKAGES((,| vs| versus| and) HD_PACKAGES.NPM_PACKAGES)?",
      "HD_PACKAGES.NPM_PACKAGES vs HD_PACKAGES.NPM_PACKAGES( vs HD_PACKAGES.NPM_PACKAGES)?",
      "(npm )?(alternatives?( to| for)|packages? (like|similar to)) HD_PACKAGES.NPM_PACKAGES( npm)?",
      "HD_PACKAGES.NPM_PACKAGES [0-9]+(\\.[0-9]+)? vs [0-9]+(\\.[0-9]+)?",
      "(best|top) npm (package|library) for [a-zA-Z0-9 -]+",
      "(npm )?(package|library) for [a-zA-Z0-9 -]+"
    ]
  },
  client: {
    location: pkg.module,
    moduleName: pkg.umdName || 'HD' + pkg.name,
    baseURL: '/' + pkg.name
  },
  format: {
    mainline: true,
    sidebar: true
  },
  permissions: {},
  info: {},
  github: "https://github.com/NanshiYadav1212/package-info-component",
  demovideo: "https://youtu.be/IsNp0UMeL5E"
};