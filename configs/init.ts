import { Sequelize } from "sequelize";
import SequelizeAdapter, { models } from "@next-auth/sequelize-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const sequelizeAdapter = new Sequelize(
  process.env.DB_DB!,
  process.env.DB_USER!,
  process.env.DB_PW!,
  {
    host: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT!),
    dialect: "mariadb",
    define: {
      freezeTableName: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const nextAuthSeqAdapter = SequelizeAdapter(sequelizeAdapter, {
  models: {
    User: sequelizeAdapter.define("user", {
      ...models.User,
      //phoneNumber: DataTypes.STRING,
    }),
  },
});

// creates tables
// Calling sync() is not recommended in production
//sequelize.sync();

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/providers/overview
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
	// username pw auth
	CredentialsProvider({
		name: "Credentials",
		credentials: {
		  username: { label: "Username", type: "text", placeholder: "jsmith" },
		  password: { label: "Password", type: "password" },
		},
		async authorize(credentials) {
		 
		// db user
		const user = { id: "1", name: "ali", password: "ali123" };
  
		// check for credentials
		  if (credentials?.username == user.name && credentials.password == user.password) {
			return user;
		  } else {
			return null;
		  }
		},
	  }),
  ],
//   pages: {
// 	signIn:"/auth/signin"  
//   },
  adapter: nextAuthSeqAdapter,
  session: {
    strategy: "jwt",
  },
  debug: false,
};

export { sequelizeAdapter, nextAuthSeqAdapter, authOptions };
