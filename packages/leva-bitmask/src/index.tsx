import { createPlugin, useInputContext, Components, styled } from "leva/plugin";

import Bitmask from "bitmaskjs";
import { useCallback } from "react";

const { Label, Row } = Components;

const Button = styled("div", {
  outline: ".5px solid #444",
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
      },
    },
  },
});

const getLayersListFromBitmask = (bitmask: Bitmask, size = 8) => {
  const layers = [];
  for (let i = 0; i < size; i++) {
    bitmask.hasBit(i) && layers.push(i);
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
    (i: number) => {
      const bitmask = value;
      bitmask.setBit(i, !bitmask.hasBit(i));
      onUpdate(bitmask.getInteger());
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
          }}
        >
          {[...new Array(settings.size)].map((_, i) => {
            return (
              <Button
                onClick={() => {
                  handleClick(i);
                }}
                selected={!!value.hasBit(i)}
                key={i}
              >
                {value.hasBit(i) ? 1 : 0}
              </Button>
            );
          })}
        </div>
      </Row>
    </>
  );
};

export const bitmask = createPlugin({
  sanitize: (v, s) => {
    const newValue = new Bitmask(v)
    newValue.layersArray = getLayersListFromBitmask(newValue);

    return newValue;
  },
  normalize: ({ value, size }) => {
    const newValue = new Bitmask(value)
    newValue.layersArray = getLayersListFromBitmask(newValue);

    return { value: newValue, settings: { size } };
  },
  component: BitMaskPlugin,
});
