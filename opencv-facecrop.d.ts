declare module 'opencv-facecrop' {
  function facecrop(
    input_filename: string,
    output_filename: string,
    type?: string,
    quality?: number,
    factor?: number,
  ): void;

  export = facecrop;
}
