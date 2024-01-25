import fs from 'fs'

export const writeInFile = (message) => {
  fs.appendFileSync('./file.txt', message, (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
}
