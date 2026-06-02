"use client";

import { useMemo, useState } from "react";
import { MATRIX_ARTISTS, MATRIX_DATA } from "../data/mock";

interface Props {
  mode?: "compact" | "full";
}

export default function PanelMatrix({ mode = "compact" }: Props) {
  const [hovRow, setHovRow] = useState<number | null>(null);
  const [hovCol, setHovCol] = useState<number | null>(null);

  const { colTotals, colCounts, rowTotals, rowCounts } = useMemo(() => {
    const cols = MATRIX_ARTISTS.length;
    const rows = MATRIX_DATA.length;
    const colT = new Array(cols).fill(0);
    const colC = new Array(cols).fill(0);
    const rowT = new Array(rows).fill(0);
    const rowC = new Array(rows).fill(0);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = MATRIX_DATA[r][c];
        if (v != null) {
          colT[c] += v; colC[c] += 1;
          rowT[r] += v; rowC[r] += 1;
        }
      }
    }
    return { colTotals: colT, colCounts: colC, rowTotals: rowT, rowCounts: rowC };
  }, []);

  if (mode === "full") {
    const cell = 24;
    return (
      <div className="bottom-panel matrix-full">
        <div className="pt" style={{ marginBottom: 10 }}>CO-OCCURRENCE MATRIX · ARTISTS</div>
        <div className="matrix-full-scroll">
          <table className="matrix-table matrix-table-full">
            <thead>
              <tr>
                <th className="row-label"></th>
                {MATRIX_ARTISTS.map((a, ci) => (
                  <th
                    key={a}
                    className={hovCol === ci ? "axis-hl" : ""}
                    style={{ minWidth: cell * 2.2 }}
                  >
                    {a}
                  </th>
                ))}
                <th className="matrix-summary-h">AVG</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_DATA.map((row, ri) => (
                <tr
                  key={ri}
                  className={hovRow === ri ? "axis-hl-row" : ""}
                  onMouseLeave={() => { setHovRow(null); setHovCol(null); }}
                >
                  <td
                    className={`row-label ${hovRow === ri ? "axis-hl" : ""}`}
                    onMouseEnter={() => { setHovRow(ri); setHovCol(null); }}
                  >
                    {MATRIX_ARTISTS[ri]}
                  </td>
                  {row.map((val, ci) => {
                    const isCross = hovRow === ri || hovCol === ci;
                    return (
                      <td
                        key={ci}
                        className={[
                          val && val > 0.85 ? "high" : val ? "med" : "",
                          isCross ? "axis-hl-cell" : "",
                        ].filter(Boolean).join(" ")}
                        style={{ width: cell * 2.2, height: cell * 1.4, fontSize: 12 }}
                        onMouseEnter={() => { setHovRow(ri); setHovCol(ci); }}
                      >
                        {val ? val.toFixed(2) : "—"}
                      </td>
                    );
                  })}
                  <td className="matrix-summary">
                    {rowCounts[ri] ? (rowTotals[ri] / rowCounts[ri]).toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
              <tr className="matrix-footer">
                <td className="row-label matrix-summary-h">AVG</td>
                {MATRIX_ARTISTS.map((_, ci) => (
                  <td key={ci} className="matrix-summary">
                    {colCounts[ci] ? (colTotals[ci] / colCounts[ci]).toFixed(2) : "—"}
                  </td>
                ))}
                <td className="matrix-summary"></td>
              </tr>
              <tr className="matrix-footer">
                <td className="row-label matrix-summary-h">N</td>
                {MATRIX_ARTISTS.map((_, ci) => (
                  <td key={ci} className="matrix-summary">{colCounts[ci]}</td>
                ))}
                <td className="matrix-summary"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bottom-panel">
      <div className="pt" style={{ marginBottom: 6 }}>CO-OCCURRENCE MATRIX · ARTISTS</div>
      <table className="matrix-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th className="row-label"></th>
            {MATRIX_ARTISTS.map((a) => <th key={a}>{a}</th>)}
          </tr>
        </thead>
        <tbody>
          {MATRIX_DATA.map((row, ri) => (
            <tr key={ri} style={{ background: hovRow === ri ? "#0E1220" : "transparent" }}
              onMouseEnter={() => setHovRow(ri)} onMouseLeave={() => setHovRow(null)}>
              <td className="row-label">{MATRIX_ARTISTS[ri]}</td>
              {row.map((val, ci) => (
                <td key={ci} className={val && val > 0.85 ? "high" : val ? "med" : ""}>
                  {val ? val.toFixed(2) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
