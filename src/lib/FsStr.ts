export class FsStr {
  /**
   * Slugify a string.
   */
  public static slug(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036F]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  }

  public static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  public static capitalizeAll(text: string): string {
    return text.split(' ').map(word => this.capitalize(word)).join(' ')
  }

  public static capitalizeWords(text: string): string {
    return text.split(' ').map(word => this.capitalize(word)).join(' ')
  }

  public static camelCase(text: string): string {
    return text
      .split(' ')
      .map((word, index) => index === 0 ? word.toLowerCase() : this.capitalize(word))
      .join('')
  }
}
