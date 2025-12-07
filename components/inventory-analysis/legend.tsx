"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Legend() {
  return (
    <Collapsible className="bg-white border border-gray-300 rounded-md p-3 mt-4">
      <CollapsibleTrigger className="font-bold w-full text-left">Legende & Kennzahlen</CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="pl-5 mt-2 space-y-1">
          <li>
            <strong>Rang</strong> – Dichtes Ranking (1 = meistverkauft).
          </li>
          <li>
            <strong>Gewichtete Verkäufe</strong> – Absatz × Zeitfaktor (3/2/1).
          </li>
          <li>
            <strong>Umschlagwert</strong> – Gewichtete Verkäufe ÷ Bestand.
          </li>
          <li>
            <strong>Aktion</strong> – ❌ kein Bestand, ⚠️ gering, ❗ bestellen, ✅ zu viele, 🔥 Hot Seller.
          </li>
          <li>
            <strong>Modellübersicht</strong> – Zusammenfassung aller Farben, Top-3 Größen und Nachbestell-Hinweise.
          </li>
          <li>
            <strong>Größenverteilung</strong> – Gaußsche Kurve der Verkaufsverteilung nach Schuhgröße.
          </li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
