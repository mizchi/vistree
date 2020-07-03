import React from "react";

export function Layout(props: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ flex: 1, height: "100%", maxWidth: "50%" }}>
        {props.left}
      </div>
      <div
        style={{
          position: "relative",
          color: "#eee",
          background: "#222",
          flex: 1,
          height: "100%",
        }}
      >
        <Scrollable>{props.right}</Scrollable>
      </div>
    </div>
  );
}

function Scrollable(props: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
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
    </div>
  );
}
