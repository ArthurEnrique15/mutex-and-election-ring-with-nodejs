import fs from 'fs'

export const writeInFile = ({ node_id, hostname, timestamp }) => {
  const string = `Node ${node_id} accessed at ${timestamp} from ${hostname}\n`

  fs.appendFileSync('./file.txt', string, (err) => {
    if (err) throw err
    console.log('The file has been saved!')
  })
}
