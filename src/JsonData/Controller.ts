export interface Data {
  name:             string;
  core:             string;
  clock:            string;
  flashStart:       string;
  flashSizeK:       string;
  flashSizeHex:     string;
  flashPageSize:    string;
  ramStart:         string;
  ramEnd:           string;
  ramSizeHex:       string;
  ramSizeK:         string;
  heapSize:         string;
  stackSize:        string;
  makefileFPU:      string;
  makefileFLOATABI: string;
  startupFPU:       string;
  timer:            string;
  adc:              string;
  spi:              string;
  i2c:              string;
  usart:            string;
  gpio:             string;
  jlinkTaskDevice:  string;
  openocdTaskDevice:string;
  svd:              string;
  define:           string;
  include:          string;
  interrupts:       string[];
  documentation:    string[];
}

export function Is(json:Data) {
  return typeof(json.name === 'string') && typeof(json.usart === 'string');
}