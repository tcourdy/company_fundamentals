const yargs = require('yargs/yargs')
const axios = require('axios')
const fs = require('fs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv
var ticker = ""
var alphaApiKey = ""
var polygonApiKey = ""

if(!argv.ticker || !argv.alphaApiKey || !argv.polygonApiKey) {
  console.error("You must provide a ticker, an alpha vantage api key, and a polygon api key (node generate_dcf_csv.js --ticker=<ticker> --alphaApiKey=<api_key> --polygonApiKey=<api_key> )")
  process.exit(1)
} else {
  ticker = argv.ticker
  alphaApiKey = argv.alphaApiKey
  polygonApiKey = argv.polygonApiKey
  main()
}

var dcfDataKeyOrder = ["year", "free_cash_flow", "net_income", "revenue", "interest_expense", "current_debt", "long_term_debt", "total_debt", "market_cap", "earnings_before_tax", "income_tax_expense", "shares_outstanding", "beta"]

var dcfData = {}

dcfDataKeyOrder.forEach(key => {
  dcfData[key] = []
})


async function main() {
  await getCompanyOverview()
  await getCompanyFinancials()
  await generateCsv()
  console.log("Jobs done\n")
}

async function getCompanyOverview() {
  try {
    let resp = await axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${alphaApiKey}`);
    if(resp.status != 200) {
      console.error(`Alphavantage overview endpoint returned status of ${resp.status} -- ${resp.statusText}`)
      process.exit(1)
    }
    dcfData.beta.push(resp.data.Beta)
    dcfData.shares_outstanding.push(resp.data.SharesOutstanding)
  }catch (error) {
    console.error(`There was an error getting company overview:  ${error.stack}`)
    process.exit(1)
  }
}

async function getCompanyFinancials() {
  try {
    let resp = await axios.get(`https://api.polygon.io/v2/reference/financials/${ticker}?limit=5&type=YA&sort=-reportPeriod&apiKey=${polygonApiKey}`)
    if(resp.status != 200) {
      console.error(`Polygon financials endpoint returned status of ${resp.status} -- ${resp.statusText}`)
      process.exit(1)
    }

    resp.data.results.forEach(data => {
      dcfData.year.push(data.reportPeriod)
      dcfData.net_income.push(data.netIncome)
      dcfData.free_cash_flow.push(data.freeCashFlow)
      dcfData.revenue.push(data.revenues)
      dcfData.interest_expense.push(data.interestExpense)
      dcfData.total_debt.push(data.debt)
      dcfData.current_debt.push(data.debtCurrent)
      dcfData.long_term_debt.push(data.debtNonCurrent)
      dcfData.income_tax_expense.push(data.incomeTaxExpense)
      dcfData.earnings_before_tax.push(data.earningsBeforeTax)
      dcfData.market_cap.push(data.marketCapitalization)
    })
  } catch (error) {
    console.error(`There was an error getting company financials:  ${error.stack}`)
    process.exit(1)
  }
}

async function generateCsv() {
  let date = new Date();

  try {
    let fd = fs.openSync(`./${ticker}_dcf_${date.getMonth()}-${date.getDay()}-${date.getFullYear()}.csv`, 'w+')

    dcfDataKeyOrder.forEach(key => {
      let comma_string = `${key},${dcfData[key].reverse().join()}\n`
      fs.writeSync(fd, comma_string)
    })

    fs.closeSync(fd)
  } catch(error) {
    console.error(`There was an issue creating csv file: ${error.stack}`)
    process.exit(1)
  }

}
