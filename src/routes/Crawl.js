const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const { checkImage, extractHostname, autoScroll } = require("../utils/index");

// @route GET api/category
// @desc Get all Category
// @access Public
router.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    const domain = url ? extractHostname(url) : "";
    let imgs = undefined;

    if (url) {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--disable-setuid-sandbox"],
        ignoreHTTPSErrors: true,
      });
      try {
        const page = await browser.newPage();
        await page.goto(url, {
          waitUntil: "networkidle2",
        });
        await autoScroll(page, 100)
        imgs = await page.evaluate(() => {
          let titleLinks = document.querySelectorAll("img");
          titleLinks = [...titleLinks];
          const data = titleLinks.map((link) => ({
            src: link.getAttribute("src"),
            alt: link.getAttribute("alt") || "",
          }));
          return data;
        });
        imgs = imgs?.map((item) => {
          return {
            ...item,
            src: checkImage(item.src, domain, url),
          };
        });
        imgs = [...new Map(imgs.map((item) => [item["src"], item])).values()];
        await browser.close();
      } catch (error) {
        await browser.close();
        return res.status(400).json({ success: false, message: error.message });
      }
    }
    return res.status(200).json({ success: true, data: imgs });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
});

module.exports = router;
