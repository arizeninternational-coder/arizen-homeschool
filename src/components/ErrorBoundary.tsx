"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: error.stack || error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error.message);
    console.error("[ErrorBoundary] Stack:", error.stack);
    console.error("[ErrorBoundary] ComponentStack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", padding: "20px", background: "#fef2f2", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 12, border: "2px solid #ef4444" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#dc2626", marginBottom: 12 }}>
              🦉 Page Error (Debug)
            </h2>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 12, color: "#991b1b" }}>Error:</strong>
              <pre style={{ fontSize: 13, color: "#1e293b", background: "#f1f5f9", padding: 10, borderRadius: 6, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: "4px 0" }}>
                {this.state.error.message}
              </pre>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ fontSize: 12, color: "#991b1b" }}>Stack:</strong>
              <pre style={{ fontSize: 11, color: "#475569", background: "#f8fafc", padding: 10, borderRadius: 6, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", margin: "4px 0", maxHeight: 300 }}>
                {this.state.errorInfo}
              </pre>
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: "#64748b" }}>
              Route: {typeof window !== "undefined" ? window.location.pathname : "SSR"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => this.setState({ error: null, errorInfo: "" })}
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
