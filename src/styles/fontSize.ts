const fontSize: number = 17

export default {
  verySmall: fontSize - 6,
  small: fontSize - 3,
  normal: fontSize,
  big: fontSize + 3,
  veryBig: fontSize + 6
}

export const getFontSize = (sizeName?: string) => {
  switch (sizeName) {
    case "tiny":
      return fontSize - 6
    case "small":
      return fontSize - 3
    case "medium":
      return fontSize - 2
    case "normal":
      return fontSize
    case "mediumNormal":
      return fontSize + 3
    case "bigNormal": 
      return fontSize + 5
    case "big":
      return fontSize + 7
    case "veryBig":
      return fontSize + 11
    default:
      return fontSize
  }
}