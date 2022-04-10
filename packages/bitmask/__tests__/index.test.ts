import { Bitmask } from "../src";

describe("@gsimone/bitmask", () => {
  describe("initialization", () => {
    it("no arguments", () => {
      const bitmask = new Bitmask();

      expect(bitmask.size).toEqual(8);
      expect(bitmask.getInt()).toEqual(0);
      expect(bitmask.getBits().join("")).toEqual(
        [0, 0, 0, 0, 0, 0, 0, 0].join("")
      );
    });

    it("initial as number", () => {
      const bitmask = new Bitmask(1);
      expect(bitmask.getBits().join("")).toEqual(
        [1, 0, 0, 0, 0, 0, 0, 0].join("")
      );

      const bitmask2 = new Bitmask(2);
      expect(bitmask2.getBits().join("")).toEqual(
        [0, 1, 0, 0, 0, 0, 0, 0].join("")
      );

      const bitmask3 = new Bitmask(16);
      expect(bitmask3.getBits().join("")).toEqual(
        [0, 0, 0, 0, 1, 0, 0, 0].join("")
      );

      const bitmask4 = new Bitmask(49);
      expect(bitmask4.getBits().join("")).toEqual(
        [1, 0, 0, 0, 1, 1, 0, 0].join("")
      );
    });

    it("initial size", () => {
      const bitmask = new Bitmask(0, 16);

      expect(bitmask.getBits().join("")).toEqual(
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].join("")
      );
    });

    it("initial as bits", () => {
      const bitmask = new Bitmask([0, 0, 0, 0, 1]);

      expect(bitmask.getBits().join("")).toEqual(
        [0, 0, 0, 0, 1, 0, 0, 0].join("")
      );
    });
  });

  describe("methods", () => {
    it("set bit", () => {
      const bitmask = new Bitmask(0);

      bitmask.setBit(0, 1);
      bitmask.setBit(1, 1);
      bitmask.setBit(4, 1);

      expect(bitmask.getInt()).toEqual(19);
      expect(bitmask.getBits().join("")).toEqual(
        [1, 1, 0, 0, 1, 0, 0, 0].join("")
      );

      bitmask.setBit(7, 1);
      expect(bitmask.getBits().join("")).toEqual(
        [1, 1, 0, 0, 1, 0, 0, 1].join("")
      );
    });

    it("get bit", () => {
      const bitmask = new Bitmask(2);

      expect(bitmask.getBit(0)).toEqual(0);
      expect(bitmask.getBit(1)).toEqual(1);
      expect(bitmask.getBit(2)).toEqual(0);
    });

    it("toggle bit", () => {
      const bitmask = new Bitmask(2);

      expect(bitmask.getBit(1)).toEqual(1);

      bitmask.toggleBit(1);

      expect(bitmask.getBit(1)).toEqual(0);
    });

    it("clear bit", () => {
      const bitmask = new Bitmask(2);

      expect(bitmask.getBit(1)).toEqual(1);

      bitmask.clearBit(1);

      expect(bitmask.getBit(1)).toEqual(0);
    });

    it("chaining", () => {
      const bitmask = new Bitmask(0);

      bitmask.setBit(1, 1).setBit(2, 1);

      expect(bitmask.getInt()).toEqual(6);
    });
  });
});
