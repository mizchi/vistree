import { rewriteSource } from "@mizchi/vistree/src";
import ts from "typescript";
import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { TEMPLATES } from "../data";
import { parseCode } from "@mizchi/vistree";

enum EditMode {
  CodeAndVisual = "code-and-visual",
  Code = "code",
  Visual = "visual",
}

// @ts-ignore
const initialCode = TEMPLATES[Object.keys(TEMPLATES)[0]];
const initialAst = parseCode(initialCode);

export type State = {
  mode: EditMode;
  code: string;
  checkpointCode: string;
  ast: ts.SourceFile;
};

const initialState: State = {
  mode: EditMode.CodeAndVisual,
  code: initialCode,
  checkpointCode: initialCode,
  ast: initialAst,
};

export const counter = createSlice({
  name: "counter",
  initialState,
  reducers: {
    // @ts-ignore
    updateAst(
      state: State,
      action: PayloadAction<{ prev: ts.Node; next: ts.Node }>
    ) {
      const newAst = rewriteSource(
        (state.ast as unknown) as ts.SourceFile,
        action.payload.prev,
        action.payload.next
      );
      return { ...state, ast: newAst } as State;
    },
  },
});

// export const { incrementCounter, decrementCounter } = slice.actions;

export const store = configureStore({
  reducer: counter.reducer,
});
