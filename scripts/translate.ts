/*
# Translate

Pulls data from spreadsheet and generates translations file
with variables:
* MsgT (code)
* Msg (code->key) // Needed coz i18n requires variables to be in key in a syntax which incompatible with enum
* Translations ({en: {}, de: {}})
* Languages ['en', 'de']

! Important
1. .env will be overwritten with .env.local
2. Quota for google spreadsheet api: https://developers.google.com/sheets/api/limits

! Env file and sharing sheet:

Add service user: https://stackoverflow.com/questions/38949318/google-sheets-api-returns-the-caller-does-not-have-permission-when-using-serve

Add values to .env.local:
VUE_GOOGLE_SERVICE_ACCOUNT_EMAIL = "user-name@project-name.iam.gserviceaccount.com"
VUE_GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----PRIVATE-KEY-----END PRIVATE KEY-----\n"



! Sample translationsQueue file:
```
exports.translationsQueue = [
  {
    code: 'Welcome',
    text: 'Welcome {name}!',
    isForce: true,
    error: {
      msg: 'Translation already exists, add isForce to force update',
      remoteValue: 'Hi {name}!'
    }
  }
]
```

TODO:

* Show quota-exceed errors

*/

const { translationsQueue, lastUpdated } = require('./translationsQueue')

const dotenv = require('dotenv')
const JSON5 = require('json5')
const fs = require('fs')
const { GoogleSpreadsheet } = require('google-spreadsheet')

//*===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶===🔶Constructor

type Language = 'en' | 'hi' | 'ur' | 'bn' | 'th' //* Sync at types.d.ts
enum Languages {
  en = 'en',
  hi = 'hi',
  ur = 'ur',
  bn = 'bn',
  th = 'th'
}

const DefaultLang = 'en' // Default language - served as i18n key
type Msg = { code: string; key: string }
type QueueItem = {
  code: string
  text: string
  isForce?: boolean
  error?: {
    msg: string
    remoteValue?: string
  }
}

// Helpers

const updateCell = async (sheet: any, address: string, value: string) => {
  // a1.value = 123.456
  // c6.formula = '=A1'
  // a1.textFormat = { bold: true }
  // const cell = existingRow['en']

  const hlColor = {
    red: 1,
    green: 0.8,
    blue: 0.8,
    alpha: 0
  }

  const cellCode = sheet.getCellByA1(address)
  cellCode.value = value

  //* Update color
  //! Google sheets api glitchy - bg color is updated only after clearing formating:
  //! https://github.com/theoephraim/node-google-spreadsheet/issues/353
  cellCode.clearAllFormatting()
  await cellCode.save()
  cellCode.backgroundColor = hlColor
  await cellCode.save()

  return Promise.resolve()
}
const isAlphaOnly = (val: string) => {
  return /^[a-zA-Z]+$/i.test(val)
}

const SyncErrors = {
  AlreadyExists: 'Translation already exists, add isForce to force update',
  CodeSymbols: 'Only letters are allowed in "code" field',
  CodeEmpty: '"Code" field should not be empty'
}

const printErrors = (queue: QueueItem[]) => {
  if (queue.length > 0) {
    const BgCyan = '\x1b[46m'
    const BgRed = '\x1b[41m'
    const ResetCli = '\x1b[0m'
    console.log('\n', BgRed, 'Errors', ResetCli, '\n')
    queue.forEach((q: QueueItem) => {
      console.log(BgCyan, q.code, ResetCli, `: ${q.error?.msg}`)
    })
    console.log('\n')
  }
}

dotenv.config()
const DocUrlId = process.env.VUE_APP_TRANSLATE_URL //* Id of the spreadsheet, in url

//* Init doc
const doc = new GoogleSpreadsheet(DocUrlId)

const TranslationsFile = 'src/plugins/i18n/translations.ts'
const TranslationsQueueFile = './scripts/translationsQueue.js'
const MsgCol = 'language'
const headerOutput = `/* eslint-disable */
  // IMPORTANT: Please do not edit this page, this is auto generated. 
  // To edit the contents run the following:
  // npm run translate
  // For more information refer to the readme.md file.`

//*===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷===🔷Main

const run = async () => {
  console.log('Translating...')

  //* Prevent recursive - corallary of file update write + prettier formatting
  var t = new Date()
  const throttleTime = 10
  t.setSeconds(t.getSeconds() - throttleTime)
  const queueLastUpdated = new Date(lastUpdated)
  if (queueLastUpdated > t) {
    const msg = `Translating... Cancel, last update was less than ${throttleTime}s ago`
    console.log(msg)
    // throw new Error(msg)
    return Promise.resolve()
  }

  await doc.useServiceAccountAuth({
    client_email: process.env.VUE_GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.VUE_GOOGLE_PRIVATE_KEY
  })

  //* Fetch spreadsheet
  await doc.loadInfo()
  const worksheet = doc.sheetsByIndex[0] // or use doc.sheetsById[id]

  const addRow = async (code: string, text: string) => {
    return worksheet.addRow({
      language: code,
      en: text
    })
  }

  //* vue-i18n thing, key should contain variables list in format `{var1}{var2}`
  const codeToKey = (code: string, text: string) => {
    //* Extract variables from english sentence: `{var1}, {var2}`
    const varsList = (text || '').match(/{[\w]+}/g)
    const varsString = (varsList || []).join()
    //* Compose field name
    return code + varsString
  }

  //* Only sample, doesn't affect final structure
  const sheetResults: { [key in Language]: { [key in string]: string } } = {
    [Languages.en]: {},
    [Languages.hi]: {},
    [Languages.ur]: {},
    [Languages.bn]: {},
    [Languages.th]: {}
  }

  //* Compose languages list
  await worksheet.loadHeaderRow()
  const headerRow = worksheet.headerValues
  const langs: Language[] = headerRow.filter((v: any) => v !== MsgCol)

  //* Init translation object with language fields (which will contain code->translation values)
  langs.forEach((lang: Language) => {
    lang = lang.toLowerCase() as Language
    sheetResults[lang] = {}
  })

  let Msgs: Msg[] = [] //* Object of msgs (translation codes - enum->code)

  //* Populate translations object
  const rows = await worksheet.getRows()

  const updateLocalVars = (code: string, text: string, lang: Language) => {
    const key = codeToKey(code, text) //* Compose key - merge code w vars

    const msgInstance = { code, key }
    const findByCode = (msg: any) => msg.code === code

    // Update existing msg key, ONLY for DefaultLang
    if (lang === DefaultLang) {
      const existingMsg = Msgs.find(findByCode)
      if (existingMsg) {
        existingMsg.key = key
      } else {
        Msgs.push(msgInstance)
      }
    }

    sheetResults[lang][key] = text
  }

  //* Go through each row in spreadsheet, update local translations
  rows.forEach((row: any) => {
    const code = (row[MsgCol] || '').trim() //* Helper-const

    for (const lang of langs) {
      const translatedText = row[lang]
      updateLocalVars(code, translatedText, lang)
    }
  })

  console.log('Processing sync queue...')
  //* Sync local changes to spreadsheet
  let updatedQueue: any = []

  const processQueue = async (t: QueueItem) => {
    //? Exn: check if code field is invalid
    if (!t.code) {
      t.error = { msg: SyncErrors.CodeEmpty }
      return updatedQueue.push(t)
    } else if (!isAlphaOnly(t.code)) {
      t.error = { msg: SyncErrors.CodeSymbols }
      return updatedQueue.push(t)
    }

    const findByCode = (row: any) => row['language'] === t.code
    let existingRow = rows.find(findByCode)

    if (!existingRow) {
      const row = await addRow(t.code, t.text)
      const rowNum = row._rowNumber
      await worksheet.loadCells('A' + rowNum + ':B' + rowNum) // loads a range of cells - code + en
      await updateCell(worksheet, 'A' + rowNum, t.code)
      await updateCell(worksheet, 'B' + rowNum, t.text)
    } else {
      const oldText = existingRow[DefaultLang]
      const newText = t.text
      if (oldText === newText) return //? Text is the same - success

      //? Exn: if not forced to update - notify user
      if (!t.isForce) {
        t.error = { msg: SyncErrors.AlreadyExists, remoteValue: oldText }
        return updatedQueue.push(t)
      }

      //* Update spreadsheet row for the existing translation

      const rowNum = existingRow._rowNumber
      await worksheet.loadCells('A' + rowNum + ':B' + rowNum) // loads a range of cells - code + en
      await updateCell(worksheet, 'A' + rowNum, t.code) //* Cell already exists, needed only to color the cell
      await updateCell(worksheet, 'B' + rowNum, t.text)

      //? Dev: updating cell-only
      // existingRow['en'] = t.text
      // await existingRow.save()
    }
    //TODO: check if need to save
    // await worksheet.saveUpdatedCells() // save all updates in one call
    updateLocalVars(t.code, t.text, Languages.en) //* Update local variables pending for output
  }

  for (let t of translationsQueue) {
    await processQueue(t)
  }

  printErrors(updatedQueue) //* Output errors, if any

  //* After processing queue - update queue file
  const queueLastChange = `exports.lastUpdated = "${new Date()}"\n`
  const queue = JSON.stringify(updatedQueue)
  const queueOutput = `exports.translationsQueue = ${queue}\n`
  const queueO = queueLastChange + queueOutput
  fs.writeFile(TranslationsQueueFile, queueO, function(err: any) {
    if (err) return console.log(err) //* Exn: error occured
    console.log('Translations queue output: DONE')
  })

  //* Generate MsgT enum output - types (all Msg keys)
  const makeEnumTBody = (acc: string, v: Msg) =>
    acc + `\n${v.code} = '${v.code}',`
  const msgEnumTBody = Msgs.reduce(makeEnumTBody, '')
  const msgTOutput = `export enum MsgT {${msgEnumTBody}\n}`

  //* Generate Msg enum output - enum->code mapper
  const makeEnumBody = (acc: string, v: Msg) =>
    acc + `\n${v.code} = '${v.key}',`
  const msgEnumBody = Msgs.reduce(makeEnumBody, '')
  const msgOutput = `export enum Msg {${msgEnumBody}\n}`

  //* Generate translations output
  let translationsOutput =
    'export const translations = ' + JSON5.stringify(sheetResults)
  let langOutput = `export const languages = ` + JSON5.stringify(langs)

  //* Final raw output
  const resultTextRaw = `${headerOutput}\n${msgTOutput}\n${msgOutput}\n${translationsOutput}\n${langOutput}`

  //* Write to file
  console.log('Writing to file...')
  fs.writeFile(TranslationsFile, resultTextRaw, (err: any) => {
    if (err) return console.log(err) //* Exn: error occured
    console.log('Translations are updated for languages: ', langs)
  })
  console.log('Formatting translations queue file...')
}

run().catch(console.error)
