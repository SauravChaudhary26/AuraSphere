import React from "react";
import Typewriter from "typewriter-effect";

const TypeWritter = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        fontSize: "6rem",
        fontWeight: "bold",
        fontFamily: "'Algerian'",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        color: "#333",
      }}
    >
      <span
        style={{ display: "flex", alignItems: "center", marginLeft: "350px" }}
      >
        Add&nbsp;
        <Typewriter
          options={{
            strings: [
              "an Objective",
              "a Goal",
              "an Agenda",
              "a Target",
              "an Aim",
              "an Ambition",
              "a Dream",
              "an Aspiration",
              "an idea",
            ],
            autoStart: true,
            loop: true,
            deleteSpeed: 50,
          }}
        />
      </span>
    </div>
  );
};

export default TypeWritter;
