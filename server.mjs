import {hostname} from "os";
import {readFileSync} from "fs";
import {dirname, join} from "path";
import express from "express";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";
import tlsopt from "tlsopt";
import {AuthZ} from "@zingle/authz";
import googleStrategy from "@zingle/authz-google";
import jwtStrategy from "@zingle/authz-jwt";
import localStrategy from "@zingle/authz-local";

const app = express();
const server = tlsopt.createServerSync(app);
const port = Number(process.env.LISTEN_PORT || (server.tls ? 443 : 80));
const secret = process.env.SECRET || "sekret";
const iss = process.env.ISS || hostname();
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = new URL(process.env.GOOGLE_CALLBACK_URL);
const authz = new AuthZ({passport, secret});
const version = getVersion();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
passport.use("local", localStrategy());
passport.use("jwt", jwtStrategy({secret, issuer: iss}));
passport.use("google", googleStrategy({clientID, clientSecret, callbackURL}));

app.set("views", getViewPath());
app.set("view engine", "pug");

app.use(passport.initialize());
app.use(morgan("tiny"));

// serve theme assets
app.use("/", express.static(getThemePath()));

// serve SDK for clients to use
app.use("/sdk", cors());
app.use("/sdk", express.static(getSDKPath()));

// basic informational routes
app.get("/", (req, res) => res.send(`authzd v${version}\n`));
app.get("/token", authz.authenticate("jwt"), authz.userInfo());

// token generation endpoints
app.get("/local/token", authz.authenticate("local"), authz.sign(iss));
app.get("/google/token", authz.authenticate("google"), authz.sign(iss));

// oauth handoffs
app.get("/google", authz.oauth("google", ["email"], authz.requestState()));

server.listen(port, () => {
    console.info(`authz daemon listening on port ${port}`);
});

function getProjectPath() {
    const url = new URL(import.meta.url);
    return dirname(url.pathname);
}

function getSDKPath() {
    return join(getProjectPath(), "node_modules/@zingle/authz-sdk/src");
}

function getThemePath() {
    return join(getProjectPath(), "node_modules/@zingle/authzd-theme/pub");
}

function getVersion() {
    const file = join(getProjectPath(), "package.json");
    const data = readFileSync(file);
    return JSON.parse(data).version;
}

function getViewPath() {
    return join(getProjectPath(), "view");
}
