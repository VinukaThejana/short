import { connect } from "@planetscale/database";

const config = {
  host: process.env.PLANETSCALE_HOST,
  username: process.env.PLANETSCALE_USERNAME,
  password: process.env.PLANETSCALE_PASSWORD,
};

export const planetscale = connect(config);
