// import 'dotenv/config.js';
require('dotenv').config();

const fetch = require('node-fetch');
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 8005;

const Prismic = require('@prismicio/client');
const PrismicHelpers = require('@prismicio/helpers');
const UAParser = require('ua-parser-js');

const prismicEndpoint = process.env.PRISMIC_ENDPOINT;
const accessToken = process.env.PRISMIC_ACCESS_TOKEN;

// The `routes` property is your route resolver. It defines how you will
// structure URLs in your project. Update the types to match the Custom
// Types in your project, and edit the paths to match the routing in your
// project.
const routes = [
  {
    type: 'page',
    path: '/',
  },
];

// Initialize the prismic.io api
const initAPI = (req) => {
  return Prismic.createClient(prismicEndpoint, {
    fetch,
    accessToken,
    routes,
  });
};

// Prismic Link Resolver
// https://prismic.io/docs/route-resolver#link-resolver
const handleLinkResolver = doc => {
  // Default to homepage
  return '/';
};

// Add a middleware function that runs on every route. It will inject
// the prismic context to the locals so that we can access these in
// our templates
app.use((req, res, next) => {
  const ua = UAParser(req.headers['user-agent']);

  res.locals.isDesktop = ua.device.type === undefined;
  res.locals.isPhone = ua.device.type === 'mobile';
  res.locals.isTablet = ua.device.type === 'tablet';

  res.locals.ctx = {
    endpoint: prismicEndpoint,
    linkResolver: handleLinkResolver,
  };
  res.locals.PrismicHelpers = PrismicHelpers;

  next();
});

const handleRequest = async (api) => {
  const [about, home, meta, navigation, preloader, { results: collections }] = await Promise.all([
    api.getSingle('about'),
    api.getSingle('home'),
    api.getSingle('meta'),
    api.getSingle('navigation'),
    api.getSingle('preloader'),
    api.query(Prismic.Predicates.at('document.type', 'collection'), {
      fetchLinks: 'product.image, product.model'
    }),
  ]);

  const products = [];

  collections.forEach(collection => {
    collection.data.products.forEach(({ products_product: { uid } }) => {
      products.push(find(productsData, { uid }))
    });
  });

  const assets = [];

  home.data.gallery.forEach((item) => {
    assets.push(item.image.url)
  });

  about.data.gallery.forEach((item) => {
    assets.push(item.image.url)
  });

  about.data.body.forEach((section) => {
    if (section.slice_type === 'gallery') {
      section.items.forEach((item) => {
        assets.push(item.image.url)
      });
    }
  });

  collections.forEach((collection) => {
    collection.data.products.forEach((item) => {
      assets.push(item.products_product.data.image.url)
    });
  });

  return {
    assets,
    about,
    collections,
    home,
    meta,
    navigation,
    preloader,
    products,
  };
};


// Set pug as templating engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  const document = await client.getSingle('home');
  res.render('page', { document });
});


app.get('/', async (req, res) => {
  const api = await initApi(req);
  const defaults = await handleRequest(api);

  res.render('base', { ...defaults });
});

// Query for the root path
// app.get('/', async (req, res) => {
//   const document = await client.getFirst()
//   res.render('page', { document })
// })

app.get('/about', async (req, res) => {
  res.render('pages/about');
});

app.get('/collection', (req, res) => {
  res.render('pages/collection');
});

app.get('/detail/:uid', async (req, res) => {
  res.render('pages/detail');
});

// Listen to application port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
