type Bit = 0 | 1;

export class Bitmask {
  private _int: number;

  constructor(intOrBitsArray: number | Bit[] = 0, public size = 8) {
    if (typeof intOrBitsArray === "number") {
      this._int = intOrBitsArray;
    } else {
      this._int = parseInt(intOrBitsArray.reverse().join(""), 2);
    }
  }

  set(value: number) {
    this._int = value;
  }

  getBit(index: number) {
    return this._int & (1 << index) ? 1 : 0;
  }

  setBit(index: number, value: Bit | Boolean): Bitmask {
    const mask = 1 << index;

    if (value) {
      this._int |= mask;
    } else {
      this._int &= ~mask;
    }

    return this;
  }

  toggleBit(index: number): Bitmask {
    this._int ^= 1 << index;

    return this;
  }

  clearBit(index: number): Bitmask {
    this._int &= ~(1 << index);

    return this;
  }

  getInt() {
    return this._int;
  }

  getBits(): Bit[] {
    return this._int
      .toString(2)
      .padStart(this.size, "0")
      .split("")
      .reverse()
      .map(Number) as Bit[];
  }
}
