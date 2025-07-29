"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// World map TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function WorldMapChart({ countryChart }: any) {
  const [tooltipContent, setTooltipContent] = useState("");

  // Map country data for quick lookup
  const dataMap = countryChart.reduce((acc: any, curr: any) => {
    acc[curr.country] = curr.total;
    return acc;
  }, {});

  const maxValue = Math.max(...countryChart.map((c: any) => c.total));

  const colorScale = scaleLinear<string>()
    .domain([0, maxValue])
    .range(["#e0f2fe", "#0284c7"]); // light blue -> dark blue

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Stores by Country (World Map)</CardTitle>
      </CardHeader>
      <CardContent className="relative h-[295px]">
        {/* Tooltip */}
        {tooltipContent && (
          <div className="absolute left-4 top-4 rounded bg-gray-800 px-3 py-2 text-sm text-white shadow-md">
            {tooltipContent}
          </div>
        )}

        <ComposableMap projection="geoMercator" style={{ width: "100%", height: "100%" }}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countryName = geo.properties.name;
                const value = dataMap[countryName] || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={value ? colorScale(value) : "#a7c0e8"}
                    stroke="#FFF"
                    onMouseEnter={() => {
                      setTooltipContent(`${countryName}: ${value} stores`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#2563eb", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </CardContent>
    </Card>
  );
}
