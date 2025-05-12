export function loginToLowerCase(this: any, next: () => void): void {
  const filter = this.getFilter?.();
  if (filter?.login) {
    filter.login = filter.login.toLowerCase();
    this.setQuery(filter);
  }
  next();
}
