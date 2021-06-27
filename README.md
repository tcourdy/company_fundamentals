## NOTE:  USE THIS SCRIPT AT YOUR OWN RISK.  I am not a financial advisor, and any output of this script should not be construed as financial advice.  If you base financial decisions based on the output of this script, you are a fucking idiot.


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
