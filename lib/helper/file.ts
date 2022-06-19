import fs from 'fs'
import { Log } from './log'

export class File {
  private pathPrefix = 'data/'
  private _filename: string

  public get filename(): string {
    return this._filename
  }

  public set filename(value: string) {
    this._filename = this.pathPrefix + value
  }

  constructor(filename: string) {
    this.filename = filename
  }

  writeJSON(content: any) {
    let data = JSON.stringify(content)
    fs.writeFile(this.filename, data, err => {
      if (err) {
        Log.error(err)
      }
    })

    return this
  }

  readJSON() {
    try {
      let data = fs.readFileSync(this.filename).toString()

      return JSON.parse(data)
    } catch (e) {
      Log.error(e)
    }
  }
}