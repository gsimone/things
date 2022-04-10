import { createPlugin, useInputContext, Components, styled } from "leva/plugin";

import { Bitmask } from "@gsimone/bitmask";
import React, { useCallback } from "react";

const { Label, Row } = Components;

const Button = styled("div", {
  outline: ".5px solid $highlight1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px 0",

  "&:hover": {
    background: "$highlight1",
    color: "",
    cursor: "pointer",
  },

  variants: {
    selected: {
      true: {
        background: "$accent2",
        color: "$highlight3",
        borderColor: "$accent2",
        "&:hover": {
          background: "$accent3",
        },
      },
    },
  },
});

const getLayersListFromBitmask = (bitmask: Bitmask, size = 8) => {
  const layers = [];
  for (let i = 0; i < size; i++) {
    bitmask.getBit(i) && layers.push(i);
  }
  return layers;
};

const BitMaskPlugin = () => {
  const props = useInputContext<{
    value: Bitmask;
    settings: { size: number };
  }>();

  const { label, value, onUpdate, settings } = props;

  const handleClick = useCallback(
    (i: number, shift: boolean) => {
      const bitmask = new Bitmask(value.getInt());

      if (shift) {
        bitmask.set(0);
        bitmask.setBit(i, true);
      } else {
        bitmask.setBit(i, !bitmask.getBit(i));
      }

      onUpdate(bitmask.getInt());
    },
    [value]
  );

  return (
    <>
      <Row input>
        <Label>{label}</Label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            userSelect: "none",
          }}
        >
          {[...new Array(settings.size)].map((_, i) => {
            return (
              <Button
                onClick={(e) => {
                  handleClick(i, e.shiftKey);
                }}
                selected={!!value.getBit(i)}
                key={i}
              >
                {i}
              </Button>
            );
          })}
        </div>
      </Row>
    </>
  );
};

export const bitmask = createPlugin({
  sanitize: (v, s = 8) => {
    const newValue = new Bitmask(v, s.size);
    newValue.layersArray = getLayersListFromBitmask(newValue, s.size);

    return newValue;
  },
  normalize: ({ value, size = 8 }) => {
    const newValue = new Bitmask(value, size);
    newValue.layersArray = getLayersListFromBitmask(newValue, size);

    return { value: newValue, settings: { size } };
  },
  component: BitMaskPlugin,
});
