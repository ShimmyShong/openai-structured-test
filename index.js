const { geminiInit } = require('./gemini')
const fs = require('fs')

let answerArray = [];

const init = async () => {
  try {
    for (let i = 0; i < 30; i++) {
      answerArray.push(await geminiInit("Anna booked an appointment with Alex for a gel manicure next Friday at 1:30 PM"))
    }
  } catch (err) {
    console.error(err)
    throw err
  } finally {
    fs.writeFile('answers.json', JSON.stringify(answerArray, null, 2), function (err) {
      if (err) throw err;
      console.log('Works!')
    })
  }
}

init()