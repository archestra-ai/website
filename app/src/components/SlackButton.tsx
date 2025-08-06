"use client"
import React from "react"

export function SlackButton() {
  return (
    <div style={{ width: '100%' }}>
      <a
        href="https://join.slack.com/t/archestracommunity/shared_invite/zt-39yk4skox-zBF1NoJ9u4t59OU8XxQChg"
        target="_blank"
        rel="noopener noreferrer"
        className="newsletter-form-button"
        style={{
          background: "#000",
          fontSize: 15,
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          letterSpacing: 1,
          width: "100%",
          whiteSpace: "normal",
          height: 42,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          padding: "10px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderRadius: 8,
          textAlign: "center",
          fontStyle: "normal",
          lineHeight: "22px",
          border: "2px solid #000",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          marginTop: 16,
          textDecoration: "none"
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = "#fff"
          e.currentTarget.style.color = "#000"
          e.currentTarget.style.border = "2px solid #000"
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = "#000"
          e.currentTarget.style.color = "#fff"
          e.currentTarget.style.border = "2px solid #000"
        }}
      >
        Join Slack
      </a>
    </div>
  )
} 