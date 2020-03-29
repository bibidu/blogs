/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

module.exports = {
  title: 'bibidu blogs',
  tagline: 'blogs of bibidu',
  url: 'https://github.com/bibidu',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'facebookexperimental',
  projectName: 'rome',
  themeConfig: {
    image: 'https://romejs.dev/img/rome-logo.png',
    navbar: {
      // title: 'Rome',
      // logo: {
      //   alt: 'Rome Logo',
      //   src: 'img/rome-logo.png',
      // },
      links: [
        {
          to: 'docs/others/CodeStyle/',
          label: 'Code Style',
          position: 'left',
        },
        {
          to: 'docs/others/Issues/',
          label: 'Github Issues',
          position: 'left',
        },
        {
          to: 'docs/study/dart/',
          label: 'Dart',
          position: 'left',
        },
        {
          to: 'docs/others/Others/',
          label: 'Others',
          position: 'left',
        },
        {
          to: 'docs/others/Todolist/',
          label: 'TodoList',
          position: 'left',
        },
        {
          href: 'https://github.com/facebookexperimental/rome',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
  //     links: [
  //       {
  //         title: 'Docs',
  //         items: [
  //           {
  //             label: 'Installation',
  //             to: 'docs/introduction/installation'
  //           },
  //           {
  //             label: 'Getting Started',
  //             to: 'docs/introduction/getting-started/',
  //           },
  //         ],
  //       },
  //       {
  //         title: 'Community',
  //         items: [
  //           {
  //             label: 'Code of Conduct',
  //             href:
  //               'https://github.com/facebookexperimental/rome/blob/master/.github/CODE_OF_CONDUCT.md',
  //           },
  //           {
  //             label: 'Contributing',
  //             to: 'docs/community/Contributing',
  //           },
  //         ],
  //       },
  //       {
  //         title: 'More Resources',
  //         items: [
  //           {
  //             label: 'GitHub',
  //             href: 'https://github.com/facebookexperimental/rome',
  //           },
  //         ],
  //       },
  //     ],
  //     logo: {
  //       alt: 'Facebook Open Source Logo',
  //       src: 'img/oss_logo.png',
  //       href: 'https://opensource.facebook.com/',
  //     },
  //     // Please do not remove the credits, help to publicize Docusaurus :)
      copyright: `Copyright © ${new Date().getFullYear()} bibidu. Built about blogs.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
