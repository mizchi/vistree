import React from "react";
import styled from "styled-components";

export function Scrollable(props: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
      }}
    >
      <div
        style={{
          overflowY: "auto",
          overflowX: "auto",
          height: "100%",
          whiteSpace: "nowrap",
        }}
      >
        {props.children}
      </div>
    </div>
  );
}

export const Root = styled.div`
  width: 100%;
  height: 100%;
  color: #eee;
  background: #222;
  display: grid;
  grid-template-rows: 40px 1fr;
  grid-template-columns: 1fr;
  grid-template-areas:
    "header"
    "content";
`;

export const HeaderContainer = styled.div`
  grid-area: header;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
`;

export const ContentContainer = styled.div`
  grid-area: content;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
`;
