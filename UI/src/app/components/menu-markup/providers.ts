export class PageProvider {
  public current: number = 0;

  changePage(value: number) {
    this.current = value;
  }
}
