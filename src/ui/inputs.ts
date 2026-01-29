import type { BindingParams } from "@tweakpane/core";
import type { FolderApi } from "tweakpane";
import { Lib } from "../lib";

const renderContainer = document.getElementById("render-container");

type Input<T> = {
  getValue: () => T;
  setValue: (value: T) => void;
};

type Params<V> = BindingParams & {
  initialValue: V;
  onChange: (value: V) => void;
};

export function addInput<V>(
  folder: FolderApi,
  { initialValue, onChange, ...bindingParams }: Params<V>,
): Input<V> {
  const state = { value: initialValue };

  const binding = folder
    .addBinding(state, "value", bindingParams)
    .on("change", (event) => onChange(event.value));

  function setValue(value: V) {
    state.value = value;
    binding.refresh();
  }

  function getValue() {
    return state.value;
  }

  return {
    getValue,
    setValue,
  };
}

type PercentParams = Params<number> & { hotKey?: string; normalized?: boolean };

export function addPercentInput(folder: FolderApi, params: PercentParams) {
  const min = 0;
  const max = 100;
  const step = 1;
  const { label, hotKey, onChange, initialValue } = params;

  const numberInput = addInput(folder, {
    ...params,
    label: hotKey ? `${label} % [${hotKey}]` : `${label} %`,
    min,
    max,
    step,
    initialValue: initialValue * 100,
    onChange: (value: number) => onChange(value / 100),
  });

  if (hotKey && renderContainer) {
    renderContainer.addEventListener(
      "wheel",
      (event) => {
        if (!Lib.isKeyPressed(hotKey)) return;

        const dir = event.deltaY < 0 ? 1 : -1;
        event.stopImmediatePropagation();
        event.preventDefault();

        const value = Lib.clamp(min, max, numberInput.getValue() + dir * step);
        numberInput.setValue(value);
      },
      { passive: false },
    );
  }

  return numberInput;
}
