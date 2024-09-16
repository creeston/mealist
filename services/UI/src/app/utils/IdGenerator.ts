export class IdGenerator {
  private static readonly ID_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  public static generateId(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += this.ID_CHARS.charAt(
        Math.floor(Math.random() * this.ID_CHARS.length)
      );
    }
    return result;
  }
}
