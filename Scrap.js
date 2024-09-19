const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

function readAccountsFromFile(filePath) {
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
}

function saveOutputToFile(account, output) {
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const filePath = path.join(outputDir, `${account}.txt`);
  fs.writeFileSync(filePath, output, "utf-8");
}

function saveTotalMentions(totalCount, stockSymbol, interval) {
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const filePath = path.join(outputDir, `total_mentions.txt`);
  const output = `${stockSymbol} was mentioned ${totalCount} times in the last ${interval} minutes.`;
  fs.writeFileSync(filePath, output, "utf-8");
}

async function scrapeTwitterForStocks(accounts, stockSymbol) {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  let totalCount = 0;

  for (let account of accounts) {
    const url = `https://twitter.com/${account}`;
    console.log(`Navigating to: ${url}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      console.log(`Successfully navigated to ${url}`);
    } catch (err) {
      console.error(`Account Not Found ${url}:`, err);
      continue;
    }

    try {
      await page.waitForSelector("article", { timeout: 10000 });
      console.log(`Found Tweets on ${url}`);
    } catch (err) {
      console.error(`No Tweets Found on ${url}:`, err);
      continue;
    }

    try {
      const count = await page.evaluate((stockSymbol) => {
        const tweets = Array.from(document.querySelectorAll("article"));
        return tweets.filter((tweet) => tweet.innerText.includes(stockSymbol))
          .length;
      }, stockSymbol);

      totalCount += count;
      const output = `'${stockSymbol}' was mentioned '${count}' times by ${account}.`;
      console.log(output);
      saveOutputToFile(account, output);
    } catch (err) {
      console.error(`Error extracting data from ${url}:`, err);
      continue;
    }
  }

  await browser.close();
  saveTotalMentions(totalCount, stockSymbol, interval);
  return `${stockSymbol} was mentioned ${totalCount} times in the last ${interval} minutes.`;
}

const accounts = readAccountsFromFile(path.join(__dirname, "accounts.txt"));
const stockSymbol = "$TSLA";
const interval = 15;

scrapeTwitterForStocks(accounts, stockSymbol)
  .then((result) => console.log(result))
  .catch((error) => console.error("Initial scraping failed:", error));

setInterval(() => {
  console.log(`Starting scrape at ${new Date().toLocaleTimeString()}`);
  scrapeTwitterForStocks(accounts, stockSymbol)
    .then((result) => console.log(result))
    .catch((error) => console.error("Scraping failed:", error));
}, interval * 60000);
