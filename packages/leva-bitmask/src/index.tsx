import { createPlugin, useInputContext, Components, styled } from "leva/plugin";

import Bitmask from 'bitmaskjs'
import { useCallback, useMemo } from "react";

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
        color: "$highlight3"
      }
    }
  }
});

const BitMaskPlugin = () => {
  const props = useInputContext<{
    value: number;
    settings: { size: number };
  }>();
  const { label, value, onUpdate, settings } = props;

  const bitmask = useMemo(() => new Bitmask(value, settings.size), [value, settings.size]);
  
  const handleClick = useCallback((i: number) => {

    const bitmask = new Bitmask(value, settings.size)
    bitmask.setBit(i, !bitmask.hasBit(i))
    onUpdate(bitmask.getInteger());
  }, [value])

  return (
    <>
      <Row input>
        <Label>
          {label}
        </Label>
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
                  handleClick(i)
                }}
                selected={!!bitmask.hasBit(i)}
                key={i}
              >
                {bitmask.hasBit(i) ? 1 : 0}
              </Button>
            );
          })}
        </div>
      </Row>
    </>
  );
};

export const bitmask = createPlugin({
  sanitize: (v, s) => v,
  format: (v) => v,
  normalize: ({ value, size }) => ({ value, settings: { size } }),
  component: BitMaskPlugin,
});
