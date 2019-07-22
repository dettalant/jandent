export class JandentError implements Error {
  public name = "JandentError";

  constructor(public message: string) {}

  toString() {
    return this.name + ": " + this.message;
  }
}
