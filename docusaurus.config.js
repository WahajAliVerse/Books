// @ts-check
// `@type` JSDoc annotations allow IDEs and type checkers to infer types
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics: Professional Guide to Design, Simulation, and Deployment',
  tagline: 'Comprehensive professional guide to humanoid robotics with ROS 2, AI, and simulation',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Physical-AI-Humanoid-Robotics', // Usually your GitHub org/user name.
  projectName: 'physical-ai-book', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'ignore',
  onBrokenAnchors: 'ignore',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'], // Adding Urdu for translation features
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr', // left-to-right text direction
      },
      ur: {
        label: 'Urdu',
        direction: 'rtl', // right-to-left text direction
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Remove this to remove the "edit this page" links.
          editUrl: undefined, // Removing edit URL for the book
        },
        blog: false, // Disable blog functionality for the book
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],




  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Physical AI & Humanoid Robotics',
        logo: {
          alt: 'Physical AI Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Book Chapters',
          },
          {
            href: '/chatbot',
            label: 'Chatbot',
            position: 'right',
          },
          {
            href: '/profile',
            label: 'Profile',
            position: 'right',
          },
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Chapters',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Chapter 1: The Robotic Nervous System (ROS 2)',
                to: '/docs/chapter1/',
              },
              {
                label: 'Chapter 2: The Digital Twin (Gazebo & Unity)',
                to: '/docs/chapter2/',
              },
              {
                label: 'Chapter 3: The AI-Robot Brain (NVIDIA Isaac)',
                to: '/docs/chapter3/',
              },
              {
                label: 'Chapter 4: Vision-Language-Action (VLA)',
                to: '/docs/chapter4/',
              },
              {
                label: 'Conclusion',
                to: '/docs/conclusion',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Professional Book Series. All rights reserved.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        additionalLanguages: ['python', 'bash'], // Added Python for ROS code snippets
      },
    }),
};

module.exports = config;