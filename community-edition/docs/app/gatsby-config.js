module.exports = {
  siteMetadata: {
    siteUrl: "https://zachfox.io/hubs-community-edition-docs",
    title: "Mozilla Hubs Community Edition Documentation",
    titleTemplate: "%s · Hubs Community Edition Documentation",
    description: "This tool generates documentation for Mozilla Hubs Community Edition, including a Getting Started guide.",
    image: "/mainMetaImage.jpg"
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-postcss",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: `Hubs Community Edition Docs`,
        short_name: `Hubs Community Edition Docs`,
        start_url: `/hubs-community-edition-docs/`,
        background_color: `#77c8e4`,
        theme_color: `#77c8e4`,
        display: `standalone`,
        icon: "src/images/hubs.png",
        icon_options: {
          purpose: `any maskable`,
        },
      },
    },
  ],
  proxy: {
    prefix: "/api",
    url: "http://localhost:6381"
  },
  pathPrefix: `/hubs-community-edition-docs`
};