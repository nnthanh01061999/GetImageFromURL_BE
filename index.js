require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const AuthRoute = require("./src/routes/AuthRoute");
const UserRoute = require("./src/routes/UserRoute");
const CrawlRoute = require("./src/routes/Crawl");

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.emhu1.mongodb.net/meowmate?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDB();
const app = express();

const corOptions = {
  origin: [process.env.ALLOW_ORIGIN, process.env.ALLOW_ORGIN_LOCAL],
  optionsSuccessStatus: 200,
};

app.use(cors(corOptions));
app.use(express.json());
app.set("trust proxy", true);

app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/crawl", CrawlRoute);

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => console.log(`Server run at port ${PORT}`));
