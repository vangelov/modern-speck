import type { BindingParams, TpChangeEvent } from "@tweakpane/core";
import type { FolderApi } from "tweakpane";
import { Lib } from "../lib";

const renderContainer = document.getElementById("render-container");

type Input<T> = {
  getValue: () => T;
  setValue: (value: T) => void;
  reset: (value: T) => void;
};

type Params<V> = BindingParams & {
  initialValue: V;
  onChange?: (value: V) => void;
};

export function addInput<V>(
  folder: FolderApi,
  { initialValue, onChange, ...bindingParams }: Params<V>,
): Input<V> {
  const state = { value: initialValue };
  const binding = folder.addBinding(state, "value", bindingParams);

  function changeHandler(event: TpChangeEvent<V>) {
    onChange && onChange(event.value);
  }

  binding.on("change", changeHandler);

  function setValue(value: V) {
    if (value === state.value) return;
    state.value = value;
  }

  function getValue() {
    return state.value;
  }

  function reset(value: V) {
    state.value = value;
    binding.off("change", changeHandler);
    binding.refresh();
    binding.on("change", changeHandler);
  }

  return {
    getValue,
    setValue,
    reset,
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
    onChange: onChange ? (value: number) => onChange(value / 100) : undefined,
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

  return {
    ...numberInput,
    reset: (value: number) => numberInput.reset(value * 100),
  };
}
