declare module 'heic-decode' {
  export interface DecodedHeic {
    width: number
    height: number
    data: Uint8ClampedArray
  }

  export interface HeicImage {
    width: number
    height: number
    decode: () => Promise<DecodedHeic>
  }

  export interface HeicImageList extends Array<HeicImage> {
    dispose: () => void
  }

  interface DecodeHeic {
    (input: { buffer: Uint8Array }): Promise<DecodedHeic>
    all: (input: { buffer: Uint8Array }) => Promise<HeicImageList>
  }

  const decodeHeic: DecodeHeic
  export default decodeHeic
}
