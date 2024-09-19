# Twitter Stock Symbol Scraper

This project is a Node.js script that scrapes Twitter accounts for mentions of a specific stock symbol (cashtag) without using the Twitter API.
The tool navigates to the specified Twitter accounts, checks their recent tweets for the stock symbol, and logs the number of mentions. The results are stored in separate files for each account,
as well as a summary file that contains the total mentions across all accounts.

## Features

- Scrapes the latest tweets from a list of Twitter accounts for mentions of a specific stock symbol (e.g., `$TSLA`).
- Stores the results for each account in a separate text file in the `output` directory.
- Generates a summary file showing the total number of mentions across all accounts in the last specified interval.

