const fetch = require('node-fetch');
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  createTypes(`
    type JobDescription implements Node {
      id: Int
      name: String
      body: String
      record_type: String
      record_id: Int
      created_at: Date
      updated_at: Date
    }
    type Job implements Node {
      _id: String
      title: String
      slug: String
      department: String
      department_id: Int
      description: JobDescription
      screener_question_1: String
      screener_question_2: String
      screener_question_3: String
      created_at: Date
    }
    type Career implements Node {
      _id: String
      title: String
      slug: String
      department: String
      created_at: Date
    }
  `)
}
exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}, configOptions) => {
  const {createNode} = actions;
  const {url, careersEndpoint} = configOptions;
  const baseUrl = `${url}/${careersEndpoint}`;
  const careers = await fetch(baseUrl)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  careers.forEach((career) => {
    createNode({
      ...career,
      id: createNodeId(`position-${career.slug}`),
      parent: null,
      children: [],
      internal: {
        type: 'Career',
        content: JSON.stringify(career),
        contentDigest: createContentDigest(career),
      },
    });
  });
  const details = [];
  for (const career of careers) {
    const careerDetail = await fetch(`${baseUrl}/${career.slug}`)
      .then(async(response) => response.json())
      .catch((error) => error);
      details.push(careerDetail.position)
  }
  details.forEach((detail) => 
    createNode({
      ...detail,
      id: createNodeId(`job-${detail.slug}`),
      parent: null,
      children: [],
      internal: {
        type: 'Job',
        content: JSON.stringify(detail),
        contentDigest: createContentDigest(detail),
      },
    })
  );
}
exports.onPreInit = () => console.log("Loaded gatsby-source-deutsch-hr-api")