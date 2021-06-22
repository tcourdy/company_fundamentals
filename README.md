## NOTE:  USE THIS SCRIPT AT YOUR OWN RISK.  Nothing in this repository should be considered financial advice.  In fact, if you use this script you will most likely lose money.  Markets can be highly volatile and you should fully understand the risks with the markets before investing in any company.  Additionally, the data from alpha vantage may not necessarily reflect what the company reports to the SEC.  If you want to ensure precise figures please consult the companies 10K filings located at sec.gov


Simple script to pull company financial data from alphavantage(https://www.alphavantage.co/) to assist in calculating discounted cash flow

### Requirements
- npm
- node v14
- alphavantage api key

### How to run
- Once the requirements are in place then from the top level directory run:
```
npm install
```
- Once dependencies are installed you can run the script like so:
```
node generate_dcf_csv.js --ticker=<ticker_here> --alphaApiKey=<your_api_key_here>
```


The output of the script is a .csv file with the past 5 years of relevant data for the company that you can then import into a spreadsheet in order to run further analysis on the companies figures.
