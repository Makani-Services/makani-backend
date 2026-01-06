import * as dotenv from 'dotenv';

// Load environment variables before accessing process.env
dotenv.config();

export default {
  db: {
    user: 'postgres',
    // pass: '123456', //development
    // pass: '9f8rutkg784',   //staging
    pass: process.env.DATABASE_PASSWORD,
    // process.env.NODE_ENV === 'production'
    //   ? 'j1FS84i8XqsR'
    //   : process.env.NODE_ENV === 'staging'
    //   ? 'jO1pdMlh051j'
    //   : '123123',
    host: '127.0.0.1',
    port: 5432,
    database: 'makani',
    authSource: null,
  },
  host: {
    url: 'https://mailtrap.io/',
    port: '5000',
  },
  jwt: {
    secretOrKey:
      'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY4OTE2MDYxNCwiaWF0IjoxNjg5MTYwNjE0fQ.vHQnU6DHVVYG6qVKyRPDYnnFrBoRTtrwf8ItCE_EuFs',
    accessTokenexpiresIn: 31536000, //1 year
    refreshTokenExpiresIn: 86400,
  },
  mail: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
    supportEmail: 'support@entreliving.me',
  },
};
