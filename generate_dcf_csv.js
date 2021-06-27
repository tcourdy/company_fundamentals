const yargs = require('yargs/yargs')
const axios = require('axios')
const fs = require('fs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv
var ticker = ""
var alphaApiKey = ""

if(!argv.ticker || !argv.alphaApiKey) {
  console.error("You must provide a ticker and an alpha vantage api key (node generate_dcf_csv.js --ticker=<ticker> --alphaApiKey=<api_key>)")
  process.exit(1)
} else {
  ticker = argv.ticker
  alphaApiKey = argv.alphaApiKey
  main()
}

var dcfDataKeyOrder = ["year", "free_cash_flow", "net_income", "revenue", "interest_expense", "current_long_term_debt", "long_term_debt", "total_debt", "market_cap", "income_before_tax", "income_tax_expense", "shares_outstanding", "beta", "eps", "trailing_pe"]

var dcfData = {}

dcfDataKeyOrder.forEach(key => {
  dcfData[key] = []
})


async function main() {
  await getCompanyOverview()
  await getCompanyIncomeStatement()
  await getCompanyBalanceSheet()
  await getCompanyCashFlowStatement()
  await generateCsv()
  console.log("Job's done")
}

async function getCompanyOverview() {
  try {
    let resp = await axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${alphaApiKey}`);
    if(resp.status != 200) {
      console.error(`Alphavantage overview endpoint returned status of ${resp.status} -- ${resp.statusText}`)
      process.exit(1)
    }
    dcfData.beta.push(convertNoneToZero(resp.data.Beta))
    dcfData.shares_outstanding.push(convertNoneToZero(resp.data.SharesOutstanding))
    dcfData.market_cap.push(convertNoneToZero(resp.data.MarketCapitalization))
    dcfData.eps.push(convertNoneToZero(resp.data.EPS))
    dcfData.trailing_pe.push(convertNoneToZero(resp.data.TrailingPE))
  }catch (error) {
    console.error(`There was an error getting company overview:  ${error.stack}`)
    process.exit(1)
  }
}

async function getCompanyIncomeStatement() {
  try {
    let resp = await axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${alphaApiKey}`);
    if(resp.status != 200) {
      console.error(`Alphavantage income_statement endpoint returned status of ${resp.status} -- ${resp.statusText}`)
      process.exit(1)
    }

    resp.data.annualReports.forEach(incomeStatement => {
      dcfData.year.push(convertNoneToZero(incomeStatement.fiscalDateEnding))
      dcfData.net_income.push(convertNoneToZero(incomeStatement.netIncome))
      dcfData.interest_expense.push(convertNoneToZero(incomeStatement.interestExpense))
      dcfData.income_before_tax.push(convertNoneToZero(incomeStatement.incomeBeforeTax))
      dcfData.revenue.push(convertNoneToZero(incomeStatement.totalRevenue))
      dcfData.income_tax_expense.push(convertNoneToZero(incomeStatement.incomeTaxExpense))
    })
  }catch (error) {
    console.error(`There was an error getting company income statement:  ${error.stack}`)
    process.exit(1)
  }
}

async function getCompanyBalanceSheet() {
  try {
    let resp = await axios.get(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${ticker}&apikey=${alphaApiKey}`);
    if(resp.status != 200) {
      console.error(`Alphavantage balance_sheet endpoint returned status of ${resp.status} -- ${resp.statusText}`)
      process.exit(1)
    }

    resp.data.annualReports.forEach(balanceSheet => {
      dcfData.long_term_debt.push(convertNoneToZero(balanceSheet.longTermDebt))
      dcfData.current_long_term_debt.push(convertNoneToZero(balanceSheet.currentLongTermDebt))
      dcfData.total_debt.push(convertNoneToZero(balanceSheet.shortLongTermDebtTotal))
    })
  }catch (error) {
    console.error(`There was an error getting company balance sheet:  ${error.stack}`)
    process.exit(1)
  }
}

async function getCompanyCashFlowStatement() {
    try {
    let resp = await axios.get(`https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${ticker}&apikey=${alphaApiKey}`);
    if(resp.status != 200) {
      console.error(`Alphavantage cash_flow endpoint returned status of ${resp.status} -- ${resp.statusText}`)
      process.exit(1)
    }

      resp.data.annualReports.forEach(cashFlow => {
        dcfData.free_cash_flow.push(
          Number(convertNoneToZero(cashFlow.operatingCashflow)) - Number(convertNoneToZero(cashFlow.capitalExpenditures))
        )
    })
  }catch (error) {
    console.error(`There was an error getting company cash flow:  ${error.stack}`)
    process.exit(1)
  }
}

async function generateCsv() {
  let date = new Date();

  try {
    let fd = fs.openSync(`./company_financials/${ticker}_dcf_${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}.csv`, 'w+')

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


function convertNoneToZero(fieldValue) {
  return fieldValue == "None" ? "0" : fieldValue
}
