const fetch = require('node-fetch');

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}, configOptions) => {
  const {createNode} = actions;
  const {url} = configOptions;
  const baseUrl = `${url}/careers`;

  const careers = await fetch(baseUrl)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  
  const details = careers.map(async (career) => {
    const careerDetail = await fetch(`${baseUrl}/${career.slug}`)
      .then((response) => response.json())
      .catch((error) => console.log(error));

    return careerDetail.position;
  });

  details.forEach((detail) => 
    createNode({
      ...detail,
      id: createNodeId(`job-${detail.slug}`),
      parent: null,
      children: [],
      internal: {
        type: 'jobs',
        content: JSON.stringify(detail),
        contentDigest: createContentDigest(detail),
      },
    })
  );
}

/**
 * You can uncomment the following line to verify that
 * your plugin is being loaded in your site.
 *
 * See: https://www.gatsbyjs.com/docs/creating-a-local-plugin/#developing-a-local-plugin-that-is-outside-your-project
 */
exports.onPreInit = () => console.log("Loaded gatsby-starter-plugin")
